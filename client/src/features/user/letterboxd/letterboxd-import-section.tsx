import { Button, Card, Field, Heading, HStack, Input, Link, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useState, type ChangeEvent } from 'react';
import { LuFileUp } from 'react-icons/lu';

import SimpleCheckbox from '@/components/simple-checkbox';
import { queryClient } from '@/lib/query-client';
import { importLetterboxdFilms, previewLetterboxdFilms, type LetterboxdMatch } from '@/features/user/api/letterboxd-import';
import { parseLetterboxdExport, type LetterboxdFilm } from './parse-letterboxd-export';

const BATCH_SIZE = 100;
type Category = 'watched' | 'watchlist' | 'liked' | 'ratings' | 'diary';
const categories: { value: Category; label: string }[] = [
  { value: 'watched', label: 'Watched movies' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'liked', label: 'Liked movies' },
  { value: 'ratings', label: 'Ratings' },
  { value: 'diary', label: 'Diary watches and rewatches' },
];

const batches = <T extends LetterboxdFilm>(items: T[]): T[][] => {
  const result: T[][] = [];
  let group: T[] = [];
  let watches = 0;
  for (const film of items) {
    if (group.length === BATCH_SIZE || watches + film.watches.length > 2000) {
      result.push(group);
      group = [];
      watches = 0;
    }
    group.push(film);
    watches += film.watches.length;
  }
  if (group.length) result.push(group);
  return result;
};

const LetterboxdImportSection = () => {
  const [films, setFilms] = useState<LetterboxdFilm[]>([]);
  const [matches, setMatches] = useState<LetterboxdMatch[]>([]);
  const [choices, setChoices] = useState<Record<string, number | null>>({});
  const [selected, setSelected] = useState<Category[]>(categories.map(({ value }) => value));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [searches, setSearches] = useState<Record<string, string>>({});
  const [visibleUnresolved, setVisibleUnresolved] = useState(50);
  const [visibleMatched, setVisibleMatched] = useState(50);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFilms([]);
    setMatches([]);
    setChoices({});
    setComplete(false);
    setVisibleUnresolved(50);
    setVisibleMatched(50);
    setError('');
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await parseLetterboxdExport(file);
      const found: LetterboxdMatch[] = [];
      let matchedCount = 0;
      setProgress(`Matching movies: 0 of ${parsed.length}`);
      for (const group of batches(parsed)) {
        found.push(...await previewLetterboxdFilms(group));
        matchedCount += group.length;
        setProgress(`Matched ${matchedCount} of ${parsed.length} movies`);
      }
      setFilms(parsed);
      setMatches(found);
      setChoices(Object.fromEntries(found.map((match) => [match.uri, match.suggestedId])));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read this Letterboxd export.');
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const searchAgain = async (film: LetterboxdFilm) => {
    setBusy(true);
    setError('');
    try {
      const [result] = await previewLetterboxdFilms([{ ...film, title: searches[film.uri]?.trim() || film.title }]);
      setMatches((current) => current.map((match) => match.uri === film.uri ? result : match));
      setChoices((current) => ({ ...current, [film.uri]: null }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not search for this movie.');
    } finally {
      setBusy(false);
    }
  };

  const included = films.flatMap((film) => {
    const tmdbId = choices[film.uri];
    if (tmdbId == null) return [];
    const item = {
      ...film,
      watched: selected.includes('watched') && film.watched,
      watchlist: selected.includes('watchlist') && film.watchlist,
      liked: selected.includes('liked') && film.liked,
      rating: selected.includes('ratings') ? film.rating : null,
      watches: selected.includes('diary') ? film.watches : [],
      tmdbId,
    };
    return item.watched || item.watchlist || item.liked || item.rating != null || item.watches.length ? [item] : [];
  });
  const choiceCount = included.length;
  const unresolved = films.filter((film) => choices[film.uri] == null);
  const matched = films.filter((film) => choices[film.uri] != null);
  const matchByUri = new Map(matches.map((match) => [match.uri, match]));
  const conflicting = included.filter((film) => {
    const mappedId = matchByUri.get(film.uri)?.mappedId;
    return mappedId != null && mappedId !== film.tmdbId;
  });
  const effects = { existing: 0, ratingsKept: 0, newWatches: 0, importedWatches: 0 };
  for (const film of included) {
    const match = matchByUri.get(film.uri);
    const candidate = match?.candidates.find((item) => item.id === film.tmdbId);
    if (candidate?.existing) effects.existing += 1;
    if (film.rating != null && candidate?.ratingKept) effects.ratingsKept += 1;
    if (film.watches.length) {
      effects.importedWatches += match?.importedWatches ?? 0;
      effects.newWatches += film.watches.length - (match?.importedWatches ?? 0);
    }
  }

  const importSelected = async () => {
    if (conflicting.length) {
      setError('A previously imported match differs. Select the original TMDB movie or skip it.');
      return;
    }
    const chosenIds = included.map((film) => film.tmdbId);
    if (new Set(chosenIds).size !== chosenIds.length) {
      setError('Two Letterboxd entries point to the same TMDB movie. Skip one before importing.');
      return;
    }
    setBusy(true);
    setError('');
    setComplete(false);
    let imported = 0;
    try {
      for (const group of batches(included)) {
        await importLetterboxdFilms(group);
        imported += group.length;
        setProgress(`Imported ${imported} of ${included.length} movies`);
      }
      await queryClient.invalidateQueries();
      setCompletedCount(imported);
      setComplete(true);
    } catch (caught) {
      setError(`Import stopped after ${imported} movies. ${caught instanceof Error ? caught.message : 'Please try again.'} Re-importing the same ZIP won't duplicate completed diary entries.`);
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const renderChoice = (film: LetterboxdFilm) => {
    const match = matchByUri.get(film.uri);
    return (
      <Field.Root key={film.uri}>
        <Field.Label>{film.title} ({film.year})</Field.Label>
        <NativeSelect.Root disabled={busy} colorPalette="brand">
          <NativeSelect.Field
            value={choices[film.uri] ?? ''}
            onChange={(event) => setChoices((current) => ({
              ...current,
              [film.uri]: event.target.value ? Number(event.target.value) : null,
            }))}
          >
            <option value="">Skip this movie</option>
            {match?.candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title} ({candidate.year ?? 'year unknown'}) · TMDB #{candidate.id}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
        {match?.error ? <Field.HelperText>Search failed. Try again before importing.</Field.HelperText> : null}
        {match?.mappedId != null && choices[film.uri] != null && match.mappedId !== choices[film.uri] ? (
          <Field.HelperText>
            Previously imported as TMDB #{match.mappedId}. Search for that movie or skip it; a different match is blocked.
          </Field.HelperText>
        ) : null}
        {choices[film.uri] != null ? (
          <Field.HelperText>
            <Link href={`https://www.themoviedb.org/movie/${choices[film.uri]}`} target="_blank" rel="noopener noreferrer">
              Check selected movie on TMDB
            </Link>
          </Field.HelperText>
        ) : null}
        {choices[film.uri] == null ? (
          <HStack mt="2">
            <Input
              aria-label={`Search TMDB for ${film.title}`}
              placeholder="Try another title"
              value={searches[film.uri] ?? ''}
              onChange={(event) => setSearches((current) => ({ ...current, [film.uri]: event.target.value }))}
            />
            <Button colorPalette="gray" variant="outline" disabled={busy} onClick={() => searchAgain(film)}>
              Search
            </Button>
          </HStack>
        ) : null}
      </Field.Root>
    );
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap="2">
          <LuFileUp aria-hidden />
          <Heading as="h3" textStyle="subsectionTitle">Import from Letterboxd</Heading>
        </HStack>
        <Text textStyle="supporting" color="fg.muted">
          Choose your Letterboxd export ZIP. I only read active film files; profile details, reviews and deleted entries stay out of the import.
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          <Field.Root>
            <Field.Label>Letterboxd export ZIP</Field.Label>
            <Input type="file" accept=".zip,application/zip" disabled={busy} onChange={handleFile} />
            <Field.HelperText>ZIP, up to 10 MB. Movie matching uses TMDB and may take a while for large libraries.</Field.HelperText>
          </Field.Root>
          {progress ? <Text role="status" textStyle="supporting">{progress}</Text> : null}
          {error ? <Text role="alert" color="fg.error" textStyle="supporting">{error}</Text> : null}
          {films.length ? (
            <Stack gap="4">
              <Text textStyle="supporting">
                {matched.length} matched, {unresolved.length} need review or will be skipped. I won't replace existing ratings or invent watch dates.
              </Text>
              <Stack gap="2">
                {categories.map(({ value, label }) => (
                  <SimpleCheckbox
                    key={value}
                    checked={selected.includes(value)}
                    onCheckedChange={(details) => setSelected((current) =>
                      details.checked === true ? [...current, value] : current.filter((item) => item !== value),
                    )}
                    label={label}
                  />
                ))}
              </Stack>
              {included.length ? (
                <Text textStyle="supporting">
                  {included.length - effects.existing} new, {effects.existing} already tracked;{' '}
                  {effects.ratingsKept} existing rating kept.
                  {selected.includes('diary') ? (
                    <> {effects.newWatches} new diary {effects.newWatches === 1 ? 'watch' : 'watches'}, {effects.importedWatches} already imported.</>
                  ) : null}
                </Text>
              ) : null}
              {conflicting.length ? (
                <Text role="alert" textStyle="supporting" color="fg.error">
                  A previously imported match differs for {conflicting.length} {conflicting.length === 1 ? 'movie' : 'movies'}. Search for the original TMDB movie or skip it before importing.
                </Text>
              ) : null}
              {unresolved.length ? (
                <Stack gap="3">
                  <Heading as="h4" textStyle="cardTitle">Needs review</Heading>
                  {unresolved.slice(0, visibleUnresolved).map(renderChoice)}
                  {unresolved.length > visibleUnresolved ? (
                    <Button colorPalette="gray" variant="outline" onClick={() => setVisibleUnresolved((count) => count + 50)}>
                      Show more to review
                    </Button>
                  ) : null}
                </Stack>
              ) : null}
              {matched.length ? (
                <details>
                  <summary>Review {matched.length} selected matches</summary>
                  <Stack gap="3" mt="3">
                    {matched.slice(0, visibleMatched).map(renderChoice)}
                    {matched.length > visibleMatched ? (
                      <Button colorPalette="gray" variant="outline" onClick={() => setVisibleMatched((count) => count + 50)}>
                        Show more matches
                      </Button>
                    ) : null}
                  </Stack>
                </details>
              ) : null}
              <Button colorPalette="brand" disabled={busy || !choiceCount || !selected.length || conflicting.length > 0} onClick={importSelected}>
                Import {choiceCount} {choiceCount === 1 ? 'film' : 'films'}
              </Button>
            </Stack>
          ) : null}
          {complete ? (
            <Text role="status">Import complete: {completedCount} movies processed. {unresolved.length} unmatched or skipped.</Text>
          ) : null}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default LetterboxdImportSection;
