import { BlobReader, ZipReader, type FileEntry } from '@zip.js/zip.js';
import Papa from 'papaparse';

const ENTRY_NAMES = ['watched.csv', 'ratings.csv', 'diary.csv', 'watchlist.csv', 'likes/films.csv'] as const;
type EntryName = (typeof ENTRY_NAMES)[number];

const MAX_ZIP_BYTES = 10 * 1024 * 1024;
const MAX_ENTRY_BYTES = 3 * 1024 * 1024;
const MAX_ENTRIES = 2048;
const MAX_FILMS = 5000;

export interface LetterboxdWatch {
  sourceUri: string;
  sourceId: string;
  watchedOn: string | null;
}

export interface AmbiguousDiaryEntry extends LetterboxdWatch {
  title: string;
  year: number;
  rating: number | null;
  filmUris: string[];
  diaryOnly: boolean;
}

export interface LetterboxdFilm {
  uri: string;
  title: string;
  year: number;
  watched: boolean;
  watchlist: boolean;
  liked: boolean;
  rating: number | null;
  watches: LetterboxdWatch[];
}

export interface LetterboxdExport {
  films: LetterboxdFilm[];
  ambiguousDiary: AmbiguousDiaryEntry[];
}

const readEntry = async (entry: FileEntry, limit: number) => {
  const chunks: Uint8Array[] = [];
  let size = 0;
  await entry.getData(new WritableStream<Uint8Array>({
    write(chunk) {
      size += chunk.length;
      if (size > limit) throw new Error(`${entry.filename} is too large.`);
      chunks.push(chunk);
    },
  }), { useWebWorkers: false });
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), size };
};

const readFilmFiles = async (file: File): Promise<Partial<Record<EntryName, string>>> => {
  if (file.size > MAX_ZIP_BYTES) throw new Error('Letterboxd ZIP is too large (10 MB maximum).');
  const reader = new ZipReader(new BlobReader(file), { strictness: 'balanced' });
  const files: Partial<Record<EntryName, string>> = {};
  try {
    const entries = await reader.getEntries();
    if (entries.length > MAX_ENTRIES) throw new Error('Letterboxd ZIP contains too many files.');
    let totalBytes = 0;
    for (const entry of entries) {
      if (entry.filename.startsWith('/') || entry.filename.includes('..') || entry.filename.includes('\\') || entry.symlink) {
        throw new Error('Letterboxd ZIP contains an invalid file path.');
      }
      if (entry.encrypted) throw new Error('Encrypted Letterboxd ZIPs are not supported.');
      if (entry.directory || !ENTRY_NAMES.includes(entry.filename as EntryName)) continue;
      const name = entry.filename as EntryName;
      if (name in files) throw new Error(`Letterboxd ZIP contains two ${name} files.`);
      if (entry.compressionMethod !== 0 && entry.compressionMethod !== 8) throw new Error(`Unsupported compression in ${name}.`);
      if (entry.uncompressedSize > MAX_ENTRY_BYTES || totalBytes + entry.uncompressedSize > MAX_ZIP_BYTES) {
        throw new Error(`${name} is too large.`);
      }
      const decoded = await readEntry(entry, Math.min(MAX_ENTRY_BYTES, MAX_ZIP_BYTES - totalBytes));
      files[name] = decoded.text;
      totalBytes += decoded.size;
    }
  } finally {
    await reader.close();
  }
  return files;
};

const isDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
  new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

const parseRows = (name: EntryName, text: string): Record<string, string>[] => {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: (header) => header.replace(/^\uFEFF/, '') });
  const required = ['Date', 'Name', 'Year', 'Letterboxd URI', ...(name === 'ratings.csv' ? ['Rating'] : []), ...(name === 'diary.csv' ? ['Watched Date'] : [])];
  if (parsed.errors.length || required.some((header) => !parsed.meta.fields?.includes(header))) {
    throw new Error(`Invalid Letterboxd ${name}.`);
  }
  return parsed.data;
};

const filmKey = (uri: string) => {
  try {
    const url = new URL(uri);
    if (url.protocol === 'https:' && ['boxd.it', 'letterboxd.com', 'www.letterboxd.com'].includes(url.hostname) && url.pathname !== '/') {
      return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
    }
  } catch {
    // Invalid URI is reported with its source file below.
  }
  return null;
};

export const parseLetterboxdExport = async (file: File): Promise<LetterboxdExport> => {
  const files = await readFilmFiles(file);
  if (!Object.keys(files).length) throw new Error('Letterboxd ZIP has no supported film files.');
  const films = new Map<string, LetterboxdFilm>();
  const watchOccurrences = new Map<string, number>();

  const ambiguousDiary: AmbiguousDiaryEntry[] = [];
  const filmUrisByTitle = new Map<string, string[]>();
  const diaryOnlyUrisByTitle = new Map<string, string>();
  const titleKey = (title: string, year: number) => `${title.normalize('NFKC').trim().toLocaleLowerCase()}\u0000${year}`;
  const addFilm = (uri: string, title: string, year: number) => {
    const existing = films.get(uri);
    if (existing && existing.year !== year) throw new Error('Conflicting years for a film in the Letterboxd export.');
    if (!existing && films.size >= MAX_FILMS) throw new Error('Letterboxd export has too many films.');
    const film = existing ?? { uri, title, year, watched: false, watchlist: false, liked: false, rating: null, watches: [] };
    films.set(uri, film);
    return film;
  };
  const parseRating = (value: string | undefined, name: EntryName) => {
    if (!value?.trim()) return null;
    const stars = Number(value.trim());
    if (!Number.isInteger(stars * 2) || stars < 0.5 || stars > 5) throw new Error(`Invalid rating in ${name}.`);
    return stars * 2;
  };

  for (const name of ENTRY_NAMES.filter((entry) => entry !== 'diary.csv')) {
    const text = files[name];
    if (text === undefined) continue;
    for (const [index, row] of parseRows(name, text).entries()) {
      const uri = filmKey(row['Letterboxd URI']?.trim() ?? '');
      const title = row.Name?.trim();
      const year = Number(row.Year);
      if (!uri || !title || !/^\d{4}$/.test(row.Year?.trim() ?? '') || year < 1870 || year > 2100) {
        throw new Error(`Invalid film at row ${index + 2} in ${name}.`);
      }
      const film = addFilm(uri, title, year);
      const key = titleKey(title, year);
      const known = filmUrisByTitle.get(key) ?? [];
      if (!known.includes(uri)) filmUrisByTitle.set(key, [...known, uri]);
      if (name === 'watched.csv') film.watched = true;
      if (name === 'watchlist.csv') film.watchlist = true;
      if (name === 'likes/films.csv') film.liked = true;
      if (name === 'ratings.csv') film.rating = parseRating(row.Rating, name) ?? film.rating;
    }
  }

  const diary = files['diary.csv'];
  if (diary !== undefined) {
    for (const [index, row] of parseRows('diary.csv', diary).entries()) {
      const sourceUri = filmKey(row['Letterboxd URI']?.trim() ?? '');
      const title = row.Name?.trim();
      const year = Number(row.Year);
      if (!sourceUri || !title || !/^\d{4}$/.test(row.Year?.trim() ?? '') || year < 1870 || year > 2100) {
        throw new Error(`Invalid film at row ${index + 2} in diary.csv.`);
      }
      const date = row['Watched Date']?.trim();
      if (date && !isDate(date)) throw new Error('Invalid watched date in diary.csv.');
      const logged = row.Date?.trim() ?? '';
      if (!isDate(logged)) throw new Error('Invalid diary date in diary.csv.');
      const eventKey = `${sourceUri}:${date ?? ''}:${logged}`;
      const occurrence = (watchOccurrences.get(eventKey) ?? 0) + 1;
      watchOccurrences.set(eventKey, occurrence);
      const watch = { sourceUri, sourceId: `${date ?? 'undated'}:${logged}:${occurrence}`, watchedOn: date || null };
      const rating = parseRating(row.Rating, 'diary.csv');
      const key = titleKey(title, year);
      const filmUris = filmUrisByTitle.get(key) ?? [];
      const diaryOnlyUri = diaryOnlyUrisByTitle.get(key);
      const matchingUri = filmUris.includes(sourceUri) ? sourceUri : filmUris.length === 1 ? filmUris[0] : null;
      if (filmUris.length > 1 && !matchingUri) {
        ambiguousDiary.push({ title, year, rating, filmUris, diaryOnly: false, ...watch });
        continue;
      }
      if (!filmUris.length && diaryOnlyUri && diaryOnlyUri !== sourceUri) {
        ambiguousDiary.push({ title, year, rating, filmUris: [diaryOnlyUri], diaryOnly: true, ...watch });
        continue;
      }
      const film = addFilm(matchingUri ?? sourceUri, title, year);
      if (!filmUris.length && !diaryOnlyUri) diaryOnlyUrisByTitle.set(key, sourceUri);
      if (film.watches.length >= 200) throw new Error(`Too many diary entries for ${film.title} (200 maximum per movie).`);
      film.watched = true;
      film.watches.push(watch);
      if (film.rating === null) film.rating = rating;
    }
  }
  if (!films.size) throw new Error('Letterboxd export contains no movies to import.');
  return { films: [...films.values()], ambiguousDiary };
};
