import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/lib/query-client';
import { renderWithProviders } from '@/test/render';
import LetterboxdImportSection from './letterboxd-import-section';

const mocks = vi.hoisted(() => ({ parse: vi.fn(), post: vi.fn(), get: vi.fn() }));
vi.mock('./parse-letterboxd-export', () => ({ parseLetterboxdExport: async (file: File) => {
  const result = await mocks.parse(file);
  return Array.isArray(result) ? { films: result, ambiguousDiary: [] } : result;
} }));
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
  it('lets a diary-only rewatch join the first event after explicit confirmation', async () => {
    const first = { ...film(1), uri: 'https://boxd.it/event-one', watches: [{ sourceUri: 'https://boxd.it/event-one', sourceId: 'one', watchedOn: '2026-01-02' }] };
    const second = { title: first.title, year: first.year, sourceUri: 'https://boxd.it/event-two', sourceId: 'two', watchedOn: '2026-02-02', rating: null, filmUris: [first.uri], diaryOnly: true };
    mocks.parse.mockResolvedValue({ films: [first], ambiguousDiary: [second] });
    mocks.post.mockImplementation((path: string, payload: { films: typeof first[] }) => Promise.resolve({ data: { data: path.endsWith('/preview') ? payload.films.map((item) => ({ ...match(1), uri: item.uri })) : {} } }));
    renderImport();
    upload();
    expect(await screen.findByRole('combobox', { name: /Diary entry 1: film for Film 1 \(2001\) viewing on 2026-02-02/ })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: /Diary entry 1: film for Film 1 \(2001\) viewing on 2026-02-02/ }), { target: { value: first.uri } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import 1 movie' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', { films: [expect.objectContaining({ watches: [expect.objectContaining({ sourceUri: first.uri }), expect.objectContaining({ sourceUri: second.sourceUri })] })] }));
  });

  it('can assign a later rewatch to a second diary-only movie created earlier in the review', async () => {
    const first = { ...film(1), uri: 'https://boxd.it/a-one', watches: [{ sourceUri: 'https://boxd.it/a-one', sourceId: 'a-one', watchedOn: '2026-01-01' }] };
    const entry = { title: first.title, year: first.year, rating: null, diaryOnly: true, filmUris: [first.uri] };
    mocks.parse.mockResolvedValue({ films: [first], ambiguousDiary: [
      { ...entry, sourceUri: 'https://boxd.it/b-one', sourceId: 'b-one', watchedOn: '2026-02-01' },
      { ...entry, sourceUri: 'https://boxd.it/b-two', sourceId: 'b-two', watchedOn: '2026-03-01' },
    ] });
    mocks.post.mockImplementation((path: string, payload: { films: typeof first[] }) => Promise.resolve({ data: { data: path.endsWith('/preview') ? payload.films.map((item, index) => ({ ...match(index + 1), uri: item.uri })) : {} } }));
    renderImport();
    upload();
    fireEvent.change(await screen.findByRole('combobox', { name: /Diary entry 1: film for Film 1/ }), { target: { value: 'separate' } });
    const second = screen.getByRole('combobox', { name: /Diary entry 2: film for Film 1/ });
    expect(within(second).getByRole('option', { name: 'https://boxd.it/b-one' })).toBeInTheDocument();
    fireEvent.change(second, { target: { value: 'https://boxd.it/b-one' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import 2 movies' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', { films: expect.arrayContaining([
      expect.objectContaining({ uri: first.uri, watches: [expect.objectContaining({ sourceId: 'a-one' })] }),
      expect.objectContaining({ uri: 'https://boxd.it/b-one', watches: [expect.objectContaining({ sourceId: 'b-one' }), expect.objectContaining({ sourceId: 'b-two' })] }),
    ]) }));
  });

  it('can keep a diary-only entry separate rather than silently merging distinct movies', async () => {
    const first = { ...film(1), uri: 'https://boxd.it/event-one', watches: [{ sourceUri: 'https://boxd.it/event-one', sourceId: 'one', watchedOn: '2026-01-02' }] };
    mocks.parse.mockResolvedValue({ films: [first], ambiguousDiary: [{ title: first.title, year: first.year, sourceUri: 'https://boxd.it/event-two', sourceId: 'two', watchedOn: '2026-02-02', rating: null, filmUris: [first.uri], diaryOnly: true }] });
    mocks.post.mockImplementation((path: string, payload: { films: typeof first[] }) => Promise.resolve({ data: { data: path.endsWith('/preview') ? payload.films.map((item) => ({ ...match(1, null), uri: item.uri })) : {} } }));
    renderImport();
    upload();
    fireEvent.change(await screen.findByRole('combobox', { name: /Diary entry 1: film for Film 1/ }), { target: { value: 'separate' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    expect(await screen.findByText('Movie matches (2)')).toBeInTheDocument();
    expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/preview', { films: expect.arrayContaining([
      expect.objectContaining({ uri: first.uri, watches: [expect.objectContaining({ sourceId: 'one' })] }),
      expect.objectContaining({ uri: 'https://boxd.it/event-two', watches: [expect.objectContaining({ sourceId: 'two' })] }),
    ]) });
  });

  it('requires assigning ambiguous diary viewings before matching and imports the selected film once', async () => {
    const first = { ...film(1), title: 'Obsession' };
    const second = { ...film(2), title: 'Obsession' };
    const event = { title: 'Obsession', year: 2001, sourceUri: 'https://boxd.it/log', sourceId: '2026-01-03:2026-01-03:1', watchedOn: '2026-01-03', rating: 7, filmUris: [first.uri, second.uri] };
    mocks.parse.mockResolvedValue({ films: [first, second], ambiguousDiary: [event] });
    mocks.post.mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview') ? [match(1), match(2)] : {} } }));
    renderImport();
    upload();
    expect(await screen.findByText(/Assign diary viewings/)).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Continue to movie matching' })).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Diary entry 1: film for Obsession (2001) viewing on 2026-01-03' }), { target: { value: first.uri } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import 2 movies' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', { films: expect.arrayContaining([
      expect.objectContaining({ uri: first.uri, watches: [expect.objectContaining({ sourceUri: event.sourceUri })] }),
      expect.objectContaining({ uri: second.uri, watches: [] }),
    ]) }));
  });

  it('does not attach a diary viewing twice when matching is retried', async () => {
    const source = film(1);
    mocks.parse.mockResolvedValue({ films: [source, { ...film(2), title: source.title }], ambiguousDiary: [{ title: source.title, year: source.year, sourceUri: 'https://boxd.it/log', sourceId: 'date:1', watchedOn: '2026-01-03', rating: null, filmUris: [source.uri, film(2).uri] }] });
    mocks.post.mockRejectedValueOnce(new Error('TMDB unavailable')).mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview') ? [match(1), match(2)] : {} } }));
    renderImport();
    upload();
    fireEvent.change(await screen.findByRole('combobox', { name: 'Diary entry 1: film for Film 1 (2001) viewing on 2026-01-03' }), { target: { value: source.uri } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('TMDB unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import 2 movies' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', { films: expect.arrayContaining([
      expect.objectContaining({ uri: source.uri, watches: [expect.objectContaining({ sourceUri: 'https://boxd.it/log' })] }),
    ]) }));
  });

  it('identifies same-day ambiguous diary entries individually for keyboard users', async () => {
    const first = film(1);
    const second = { ...first, uri: film(2).uri };
    const entry = { title: first.title, year: first.year, sourceId: 'one', watchedOn: '2026-01-02', rating: null, filmUris: [first.uri, second.uri], diaryOnly: false };
    mocks.parse.mockResolvedValue({ films: [first, second], ambiguousDiary: [{ ...entry, sourceUri: 'https://boxd.it/log-one' }, { ...entry, sourceUri: 'https://boxd.it/log-two', sourceId: 'two' }] });
    renderImport();
    upload();
    expect(await screen.findByRole('combobox', { name: 'Diary entry 1: film for Film 1 (2001) viewing on 2026-01-02' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Diary entry 2: film for Film 1 (2001) viewing on 2026-01-02' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View diary entry 2' })).toHaveAttribute('href', 'https://boxd.it/log-two');
  });

  it('allows explicitly skipping an ambiguous diary viewing without assigning it to either movie', async () => {
    const first = { ...film(1), title: 'Obsession' };
    const second = { ...film(2), title: 'Obsession' };
    mocks.parse.mockResolvedValue({ films: [first, second], ambiguousDiary: [{ title: 'Obsession', year: 2001, sourceUri: 'https://boxd.it/log', sourceId: 'date:1', watchedOn: '2026-01-03', rating: null, filmUris: [first.uri, second.uri] }] });
    mocks.post.mockImplementation((path: string) => Promise.resolve({ data: { data: path.endsWith('/preview') ? [match(1), match(2)] : {} } }));
    renderImport();
    upload();
    fireEvent.change(await screen.findByRole('combobox', { name: 'Diary entry 1: film for Obsession (2001) viewing on 2026-01-03' }), { target: { value: 'skip' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    expect(await screen.findByText('1 diary viewing skipped by choice.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Import 2 movies' }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalledWith('/api/user/letterboxd/import', { films: expect.arrayContaining([
      expect.objectContaining({ uri: first.uri, watches: [] }),
      expect.objectContaining({ uri: second.uri, watches: [] }),
    ]) }));
  });

  it('skips a conflicting legacy match without blocking unrelated films', async () => {
    mocks.parse.mockResolvedValue([film(1), film(2)]);
    mocks.post.mockResolvedValue({ data: { data: [{ ...match(1, null), mappingConflict: true }, match(2)] } });
    renderImport();
    upload();
    expect(await screen.findByRole('alert')).toHaveTextContent(/conflicting TMDB matches/);
    expect(screen.getByRole('checkbox', { name: 'Include Film 1 (2001)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Import 1 movie' })).toBeEnabled();
  });

  it('leaves assigned diary viewings and successful matches reviewable after a later preview failure', async () => {
    const films = Array.from({ length: 21 }, (_, index) => film(index + 1));
    mocks.parse.mockResolvedValue({ films, ambiguousDiary: [{ title: films[0].title, year: films[0].year, sourceUri: 'https://boxd.it/log', sourceId: 'one', watchedOn: '2026-01-01', rating: null, filmUris: [films[0].uri, films[1].uri], diaryOnly: false }] });
    mocks.post.mockImplementation((path: string, payload: { films: typeof films }) => path.endsWith('/preview') && payload.films.length === 1
      ? Promise.reject(new Error('Matching unavailable'))
      : Promise.resolve({ data: { data: path.endsWith('/preview') ? payload.films.map((item) => ({ ...match(Number(item.uri.split('/').at(-1))), uri: item.uri })) : {} } }));
    renderImport();
    upload();
    fireEvent.change(await screen.findByRole('combobox', { name: /Diary entry 1: film for Film 1/ }), { target: { value: films[0].uri } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to movie matching' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Matching unavailable');
    expect(screen.getByRole('button', { name: 'Import 20 movies' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'TMDB movie for Film 21 (2001)' })).toBeInTheDocument();
    expect(screen.queryByText(/Assign diary viewings/)).not.toBeInTheDocument();
  });

  it('leaves later films reviewable when a preview batch fails', async () => {
    const films = Array.from({ length: 21 }, (_, index) => film(index + 1));
    mocks.parse.mockResolvedValue(films);
    mocks.post.mockImplementation((path: string, payload: { films: typeof films }) => path.endsWith('/preview') && payload.films.length === 1
      ? Promise.reject(new Error('Matching unavailable'))
      : Promise.resolve({ data: { data: path.endsWith('/preview') ? payload.films.map((item) => match(Number(item.uri.split('/').at(-1)))) : {} } }));
    renderImport();
    upload();
    expect(await screen.findByRole('alert')).toHaveTextContent('Matching unavailable');
    expect(screen.getByRole('button', { name: 'Import 20 movies' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Include Film 21 (2001)' })).not.toBeChecked();
  });

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
