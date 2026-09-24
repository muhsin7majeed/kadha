import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { describe, expect, it } from 'vitest';

import { parseLetterboxdExport } from './parse-letterboxd-export';

const fileFromEntries = async (entries: Record<string, string>, password?: string) => {
  const writer = new ZipWriter(new BlobWriter(), { useWebWorkers: false });
  for (const [name, value] of Object.entries(entries)) {
    await writer.add(name, new TextReader(value), password ? { password } : {});
  }
  const blob = await writer.close();
  return new File([blob], 'letterboxd.zip', { type: 'application/zip' });
};

describe('parseLetterboxdExport', () => {
  it('combines active files by film URI and keeps each dated rewatch without importing private profile data', async () => {
    const films = await parseLetterboxdExport(await fileFromEntries({
      'profile.csv': `Email Address
secret@example.com`,
      'watched.csv': `Date,Name,Year,Letterboxd URI
2026-01-02,"Film, One",2001,https://boxd.it/abc`,
      'ratings.csv': `Date,Name,Year,Letterboxd URI,Rating
2026-01-03,"Film, One",2001,https://boxd.it/abc,3.5`,
      'diary.csv': `Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
2026-02-03,"Film, One",2001,https://boxd.it/abc,3.5,Yes,"tag, private",2026-02-02
2026-02-03,"Film, One",2001,https://boxd.it/abc,3.5,Yes,"tag, private",2026-02-02`,
      'watchlist.csv': `Date,Name,Year,Letterboxd URI
2026-01-01,Second Film,1999,https://boxd.it/def`,
      'likes/films.csv': `Date,Name,Year,Letterboxd URI
2026-01-04,Film One,2001,https://boxd.it/abc`,
      'deleted/diary.csv': `Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
2026-02-01,Deleted,2000,https://boxd.it/xyz,5,No,,2026-02-01`,
    }));

    expect(films).toEqual([
      {
        uri: 'https://boxd.it/abc', title: 'Film, One', year: 2001, watched: true, watchlist: false, liked: true, rating: 7,
        watches: [
          { sourceId: expect.any(String), watchedOn: '2026-02-02' },
          { sourceId: expect.any(String), watchedOn: '2026-02-02' },
        ],
      },
      { uri: 'https://boxd.it/def', title: 'Second Film', year: 1999, watched: false, watchlist: true, liked: false, rating: null, watches: [] },
    ]);
    expect(films[0].watches[0].sourceId).not.toBe(films[0].watches[1].sourceId);
  });

  it('keeps event identities stable when different diary rows are reordered', async () => {
    const header = 'Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date';
    const first = '2026-02-03,Film,2001,https://boxd.it/abc,,No,,2026-02-02';
    const second = '2026-03-03,Film,2001,https://boxd.it/abc,,Yes,,2026-03-02';
    const a = await parseLetterboxdExport(await fileFromEntries({ 'diary.csv': [header, first, second].join('\n') }));
    const b = await parseLetterboxdExport(await fileFromEntries({ 'diary.csv': [header, second, first].join('\n') }));
    expect(a[0].watches.map((event) => event.sourceId).sort()).toEqual(b[0].watches.map((event) => event.sourceId).sort());
  });

  it('rejects missing film files and invalid film rows', async () => {
    await expect(parseLetterboxdExport(await fileFromEntries({ 'profile.csv': 'Email Address' }))).rejects.toThrow(/film files/i);
    await expect(parseLetterboxdExport(await fileFromEntries({ 'watched.csv': 'Date,Name,Year,Letterboxd URI' }))).rejects.toThrow(/no movies/i);
    await expect(parseLetterboxdExport(await fileFromEntries({ 'watched.csv': `Date,Name,Year,Letterboxd URI
2026-01-01,Film,nope,https://boxd.it/abc` }))).rejects.toThrow(/watched.csv/i);
  });

  it('rejects encrypted archives', async () => {
    await expect(parseLetterboxdExport(await fileFromEntries({ 'watched.csv': 'Date,Name,Year,Letterboxd URI' }, 'secret'))).rejects.toThrow(/Encrypted/i);
  });

  it('rejects malformed CSV and unsafe archive entries', async () => {
    await expect(parseLetterboxdExport(await fileFromEntries({ 'watched.csv': `Date,Name,Year,Letterboxd URI
2026-01-01,"unclosed,2001,https://boxd.it/abc` }))).rejects.toThrow(/watched.csv/i);
    await expect(parseLetterboxdExport(await fileFromEntries({ '../watched.csv': 'private' }))).rejects.toThrow(/Unsafe filename/i);
  });

  it('rejects oversized expansions', async () => {
    await expect(parseLetterboxdExport(await fileFromEntries({ 'watched.csv': 'Date,Name,Year,Letterboxd URI\n' + 'A'.repeat(4_000_000) }))).rejects.toThrow(/large/i);
  });
});
