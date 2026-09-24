import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/lib/query-client';
import { renderWithProviders } from '@/test/render';
import LetterboxdImportSection from './letterboxd-import-section';

const mocks = vi.hoisted(() => ({ parse: vi.fn(), post: vi.fn(), get: vi.fn() }));
vi.mock('./parse-letterboxd-export', () => ({ parseLetterboxdExport: mocks.parse }));
vi.mock('@/lib/axios-instance', () => ({ default: { post: mocks.post, get: mocks.get } }));

const film = (id: number) => ({
  uri: `https://boxd.it/${id}`, title: `Film ${id}`, year: 2001,
  watched: true, liked: false, watchlist: false, rating: null, watches: [],
});
const match = (id: number, suggestedId: number | null = 800000 + id) => ({
  uri: film(id).uri, suggestedId, mappedId: null, importedWatches: 0,
  candidates: [{ id: 800000 + id, title: `Film ${id}`, year: 2001, posterPath: '/poster.jpg', existing: false, ratingKept: false }], error: false,
});
const renderImport = () => renderWithProviders(<QueryClientProvider client={queryClient}><LetterboxdImportSection /></QueryClientProvider>);
const upload = () => fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });

beforeEach(() => { vi.clearAllMocks(); queryClient.clear(); });

describe('LetterboxdImportSection', () => {
  it('rejects an invalid ZIP without opening review', async () => {
    mocks.parse.mockRejectedValue(new Error('Letterboxd ZIP has no supported film files.'));
    renderImport();
    upload();
    expect(await screen.findByRole('alert')).toHaveTextContent('Letterboxd ZIP has no supported film files.');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('opens review after parsing and advances matching progress per preview batch', async () => {
    const films = Array.from({ length: 21 }, (_, index) => film(index + 1));
    mocks.parse.mockResolvedValue(films);
    let finish!: (value: { data: { data: ReturnType<typeof match>[] } }) => void;
    let finishLast!: (value: { data: { data: ReturnType<typeof match>[] } }) => void;
    mocks.post.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { finishLast = resolve; }));
    renderImport();
    upload();
    expect(await screen.findByRole('dialog', { name: 'Review Letterboxd import' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Matching movies' })).toHaveAttribute('aria-valuenow', '0');
    finish({ data: { data: films.slice(0, 20).map((_, index) => match(index + 1)) } });
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20'));
    finishLast({ data: { data: [match(21)] } });
    await screen.findByRole('button', { name: 'Import 21 movies' });
    expect(mocks.post.mock.calls.filter(([path]) => path.endsWith('/preview')).map(([, data]) => data.films.length)).toEqual([20, 1]);
  });

  it('imports only checked, matched entries and summarizes skips', async () => {
    mocks.parse.mockResolvedValue([film(1), film(2)]);
    mocks.post.mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview') ? [match(1), match(2)] : {} } }));
    renderImport();
    upload();
    expect(await screen.findByText('2 to import · 0 skipped')).toBeInTheDocument();
    expect(mocks.get).not.toHaveBeenCalled();
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Include Film 2 (2001)' }));
    expect(screen.getByText('1 to import · 1 skipped')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 movie' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', {
      films: [expect.objectContaining({ uri: film(1).uri, tmdbId: 800001 })],
    }));
    expect(await screen.findByText(/Import complete: 1 movie processed/)).toBeInTheDocument();
  });

  it('leaves uncertain matches unchecked and allows searching inside the movie combobox', async () => {
    mocks.parse.mockResolvedValue([film(1)]);
    mocks.post.mockResolvedValue({ data: { data: [match(1, null)] } });
    mocks.get.mockResolvedValue({ data: { data: [{ media_id: 800003, media_type: 'movie', title: 'Another Film', release_date: '2001-01-01', poster_path: '/another.jpg' }] } });
    renderImport();
    upload();
    const checkbox = await screen.findByRole('checkbox', { name: 'Include Film 1 (2001)' });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('0 to import · 1 skipped')).toBeInTheDocument();
    await userEvent.setup().click(checkbox);
    expect(screen.getByText(/checked entry needs a TMDB movie/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import 0 movies' })).toBeDisabled();
    const input = screen.getByRole('combobox', { name: 'TMDB movie for Film 1 (2001)' });
    await userEvent.setup().type(input, 'Another Film');
    await screen.findByRole('option', { name: /Another Film \(2001\)/ });
    await userEvent.setup().keyboard('{ArrowDown}{Enter}');
    expect(screen.getByText('1 to import · 0 skipped')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import 1 movie' })).toBeEnabled();
    await userEvent.setup().keyboard('{Escape}');
    expect(await screen.findByRole('button', { name: 'Return to import review' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Return to import review' }));
    expect(screen.getByRole('combobox', { name: 'TMDB movie for Film 1 (2001)' })).toHaveValue('Another Film (2001) · TMDB movie #800003');
  });

  it('does not call a rating-only manually chosen title new without evidence', async () => {
    mocks.parse.mockResolvedValue([{ ...film(1), rating: 8 }]);
    mocks.post.mockResolvedValue({ data: { data: [match(1, null)] } });
    mocks.get.mockResolvedValue({ data: { data: [{ media_id: 800003, media_type: 'movie', title: 'Another Film', release_date: '2001-01-01', poster_path: null, rating: 8 }] } });
    renderImport();
    upload();
    await userEvent.setup().click(await screen.findByRole('checkbox', { name: 'Include Film 1 (2001)' }));
    await userEvent.setup().type(screen.getByRole('combobox', { name: 'TMDB movie for Film 1 (2001)' }), 'Another Film');
    await userEvent.setup().click(await screen.findByRole('option', { name: /Another Film \(2001\)/ }));
    expect(screen.getByText('1 to import · 0 skipped')).toBeInTheDocument();
    expect(screen.queryByText(/1 new, 0 already tracked/)).not.toBeInTheDocument();
    expect(screen.getByText(/1 manually chosen movie may already be tracked/)).toBeInTheDocument();
  });

  it('does not send checked films when their only category is turned off', async () => {
    mocks.parse.mockResolvedValue([{ ...film(1), watched: false, liked: true }, film(2)]);
    mocks.post.mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview') ? [match(1), match(2)] : {} } }));
    renderImport();
    upload();
    await screen.findByText('2 to import · 0 skipped');
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Watched movies' }));
    expect(screen.getByText('1 to import · 1 skipped')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 movie' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', {
      films: [expect.objectContaining({ uri: film(1).uri, liked: true })],
    }));
  });

  it('shows partial progress and a retry-safe warning after an import batch fails', async () => {
    const films = Array.from({ length: 101 }, (_, index) => film(index + 1));
    mocks.parse.mockResolvedValue(films);
    let rejectLast!: (reason: Error) => void;
    mocks.post.mockImplementation((path: string, payload: { films: typeof films }) => {
      if (path.endsWith('/preview')) return Promise.resolve({ data: { data: payload.films.map((item) => match(Number(item.uri.split('/').at(-1)))) } });
      if (payload.films.length === 1) return new Promise((_, reject) => { rejectLast = reject; });
      return Promise.resolve({ data: { data: {} } });
    });
    renderImport();
    upload();
    fireEvent.click(await screen.findByRole('button', { name: 'Import 101 movies' }));
    expect(await screen.findByText(/Importing 100 of 101 movies/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Importing movies' })).not.toHaveAttribute('aria-valuenow');
    rejectLast(new Error('TMDB unavailable'));
    expect(await screen.findByRole('alert', { name: '' })).toHaveTextContent(/Import stopped after 100 movies/);
    expect(screen.getByText(/Re-importing the same ZIP won't duplicate completed diary entries/)).toBeInTheDocument();
  });

  it('clears a selected movie when its text is edited without choosing another result', async () => {
    mocks.parse.mockResolvedValue([film(1)]);
    mocks.post.mockResolvedValue({ data: { data: [match(1)] } });
    renderImport();
    upload();
    const input = await screen.findByRole('combobox', { name: 'TMDB movie for Film 1 (2001)' });
    expect(screen.getByText('1 to import · 0 skipped')).toBeInTheDocument();
    await userEvent.setup().type(input, ' different');
    await userEvent.setup().tab();
    expect(screen.getByRole('checkbox', { name: 'Include Film 1 (2001)' })).toBeChecked();
    expect(screen.getByText('0 to import · 1 skipped')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import 0 movies' })).toBeDisabled();
    expect(mocks.post.mock.calls.some(([path]) => path.endsWith('/import'))).toBe(false);
  });

  it('prevents a previously imported film from being rematched', async () => {
    mocks.parse.mockResolvedValue([film(1)]);
    mocks.post.mockResolvedValue({ data: { data: [{ ...match(1, null), mappedId: 800002 }] } });
    mocks.get.mockResolvedValue({ data: { data: [{ media_id: 800002, media_type: 'movie', title: 'Original Film', release_date: '2001-01-01', poster_path: null }] } });
    renderImport();
    upload();
    const input = await screen.findByRole('combobox', { name: 'TMDB movie for Film 1 (2001)' });
    const user = userEvent.setup();
    expect(screen.getByRole('checkbox', { name: 'Include Film 1 (2001)' })).not.toBeChecked();
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: /Film 1 \(2001\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Include Film 1 (2001)' }));
    expect(screen.getByText(/Previously imported as TMDB movie #800002/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import 1 movie' })).toBeDisabled();
    expect(mocks.post.mock.calls.some(([path]) => path.endsWith('/import'))).toBe(false);
    await user.clear(input);
    await user.type(input, 'Original Film');
    await user.click(await screen.findByRole('option', { name: /Original Film \(2001\)/ }));
    expect(screen.getByRole('button', { name: 'Import 1 movie' })).toBeEnabled();
  });
});
