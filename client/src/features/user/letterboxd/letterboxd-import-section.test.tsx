import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import LetterboxdImportSection from './letterboxd-import-section';

const mocks = vi.hoisted(() => ({ parse: vi.fn(), post: vi.fn() }));
vi.mock('./parse-letterboxd-export', () => ({ parseLetterboxdExport: mocks.parse }));
vi.mock('@/lib/axios-instance', () => ({ default: { post: mocks.post } }));

describe('LetterboxdImportSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('previews a ZIP, exposes match decisions, and sends only selected film data', async () => {
    mocks.parse.mockResolvedValue([{
      uri: 'https://boxd.it/abc', title: 'A Film', year: 2001, watched: true, liked: false,
      watchlist: false, rating: 7, watches: [{ sourceId: 'diary:2', watchedOn: '2026-01-03' }],
    }]);
    mocks.post.mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview')
      ? [{ uri: 'https://boxd.it/abc', suggestedId: 800001, mappedId: null, importedWatches: 0, candidates: [{ id: 800001, title: 'A Film', year: 2001, existing: false, ratingKept: false }], error: false }]
      : { created: { media: 1, watchEvents: 1 } } } }));
    renderWithProviders(<LetterboxdImportSection />);
    fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });
    expect(await screen.findByRole('button', { name: /Import 1 film/ })).toBeEnabled();
    expect(screen.getByText(/1 matched/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Check selected movie on TMDB' })).toHaveAttribute('href', 'https://www.themoviedb.org/movie/800001');
    fireEvent.click(screen.getByRole('button', { name: /Import 1 film/ }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', {
      films: [expect.objectContaining({ uri: 'https://boxd.it/abc', tmdbId: 800001 })],
    }));
    expect(screen.getByText(/Import complete/)).toBeInTheDocument();
  });

  it('previews and imports large exports in bounded batches', async () => {
    const films = Array.from({ length: 101 }, (_, index) => ({
      uri: `https://boxd.it/${index + 1}`, title: `Film ${index + 1}`, year: 2001,
      watched: true, liked: false, watchlist: false, rating: null, watches: [],
    }));
    mocks.parse.mockResolvedValue(films);
    mocks.post.mockImplementation((path: string, payload: { films: typeof films }) => Promise.resolve({ data: {
      data: path.endsWith('/preview')
        ? payload.films.map((film) => ({ uri: film.uri, suggestedId: Number(film.uri.split('/').at(-1)) + 800000, mappedId: null, importedWatches: 0, candidates: [{ id: Number(film.uri.split('/').at(-1)) + 800000, title: film.title, year: film.year, existing: false, ratingKept: false }], error: false }))
        : { created: { media: payload.films.length } },
    } }));
    renderWithProviders(<LetterboxdImportSection />);
    fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });
    const button = await screen.findByRole('button', { name: 'Import 101 films' });
    fireEvent.click(button);
    await screen.findByText(/Import complete: 101 movies processed/);
    const calls = mocks.post.mock.calls as Array<[string, { films: { uri: string }[] }]>;
    const previewCalls = calls.filter(([path]) => path.endsWith('/preview'));
    const importCalls = calls.filter(([path]) => path.endsWith('/import'));
    expect(previewCalls.map(([, payload]) => payload.films.length)).toEqual([100, 1]);
    expect(importCalls.map(([, payload]) => payload.films.length)).toEqual([100, 1]);
  });

  it('does not create empty tracking when the selected category is absent for a matched film', async () => {
    mocks.parse.mockResolvedValue([
      { uri: 'https://boxd.it/liked', title: 'Liked', year: 2001, watched: false, liked: true, watchlist: false, rating: null, watches: [] },
      { uri: 'https://boxd.it/watched', title: 'Watched', year: 2002, watched: true, liked: false, watchlist: false, rating: null, watches: [] },
    ]);
    mocks.post.mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview') ? [
      { uri: 'https://boxd.it/liked', suggestedId: 800001, mappedId: null, importedWatches: 0, candidates: [{ id: 800001, title: 'Liked', year: 2001, existing: false, ratingKept: false }], error: false },
      { uri: 'https://boxd.it/watched', suggestedId: 800002, mappedId: null, importedWatches: 0, candidates: [{ id: 800002, title: 'Watched', year: 2002, existing: false, ratingKept: false }], error: false },
    ] : { created: { media: 1 } } } }));
    renderWithProviders(<LetterboxdImportSection />);
    fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });
    await screen.findByRole('button', { name: /Import 2 films/ });
    const user = userEvent.setup();
    await user.click(screen.getByText('Watched movies'));
    await user.click(screen.getByText('Watchlist'));
    await user.click(screen.getByText('Ratings'));
    await user.click(screen.getByText('Diary watches and rewatches'));
    expect(screen.getByRole('checkbox', { name: 'Watched movies' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /Import 1 film/ }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', {
      films: [expect.objectContaining({ uri: 'https://boxd.it/liked', liked: true })],
    }));
  });

  it('shows import effects for the selected categories before confirming', async () => {
    mocks.parse.mockResolvedValue([{ uri: 'https://boxd.it/abc', title: 'A Film', year: 2001,
      watched: true, liked: false, watchlist: false, rating: 7,
      watches: [{ sourceId: 'diary:1', watchedOn: '2026-01-03' }, { sourceId: 'diary:2', watchedOn: '2026-01-04' }],
    }]);
    mocks.post.mockResolvedValue({ data: { data: [{ uri: 'https://boxd.it/abc', suggestedId: 800001,
      mappedId: 800001, importedWatches: 1,
      candidates: [{ id: 800001, title: 'A Film', year: 2001, existing: true, ratingKept: true }], error: false,
    }] } });
    renderWithProviders(<LetterboxdImportSection />);
    fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });
    expect(await screen.findByText(/1 already tracked/)).toBeInTheDocument();
    expect(screen.getByText(/1 existing rating kept/)).toBeInTheDocument();
    expect(screen.getByText(/1 new diary watch, 1 already imported/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByText('Diary watches and rewatches'));
    expect(screen.queryByText(/new diary watch/)).not.toBeInTheDocument();
  });

  it('blocks a known conflicting rematch before starting any import batch', async () => {
    mocks.parse.mockResolvedValue([{ uri: 'https://boxd.it/abc', title: 'A Film', year: 2001,
      watched: true, liked: false, watchlist: false, rating: null, watches: [],
    }]);
    mocks.post.mockResolvedValue({ data: { data: [{ uri: 'https://boxd.it/abc', suggestedId: null,
      mappedId: 800001, importedWatches: 0,
      candidates: [{ id: 800002, title: 'A Film', year: 2001, existing: false, ratingKept: false }], error: false,
    }] } });
    renderWithProviders(<LetterboxdImportSection />);
    fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });
    await screen.findByRole('combobox', { name: 'A Film (2001)' });
    fireEvent.change(screen.getByRole('combobox', { name: 'A Film (2001)' }), { target: { value: '800002' } });
    expect(screen.getByText(/previously imported match differs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import 1 film' })).toBeDisabled();
    expect(mocks.post.mock.calls.some(([path]) => path.endsWith('/import'))).toBe(false);
  });

  it('requires review when matching is ambiguous and lets the user skip a film', async () => {
    mocks.parse.mockResolvedValue([{
      uri: 'https://boxd.it/ambiguous', title: 'The Film', year: 2001, watched: true, liked: false,
      watchlist: false, rating: null, watches: [],
    }]);
    mocks.post.mockResolvedValue({ data: { data: [{ uri: 'https://boxd.it/ambiguous', suggestedId: null, mappedId: null, importedWatches: 0, candidates: [
      { id: 800001, title: 'The Film', year: 2001, existing: false, ratingKept: false }, { id: 800002, title: 'The Film', year: 2001, existing: false, ratingKept: false },
    ], error: false }] } });
    renderWithProviders(<LetterboxdImportSection />);
    fireEvent.change(screen.getByLabelText('Letterboxd export ZIP'), { target: { files: [new File(['zip'], 'letterboxd.zip')] } });
    await screen.findByText(/0 matched, 1 need review/);
    expect(screen.getByRole('button', { name: /Import 0 films/ })).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox', { name: 'The Film (2001)' }), { target: { value: '800002' } });
    expect(screen.getByRole('button', { name: /Import 1 film/ })).toBeEnabled();
    fireEvent.change(screen.getByRole('combobox', { name: 'The Film (2001)' }), { target: { value: '' } });
    expect(screen.getByRole('button', { name: /Import 0 films/ })).toBeDisabled();
  });
});
