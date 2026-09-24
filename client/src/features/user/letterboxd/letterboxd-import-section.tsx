import { Button, Card, Field, Heading, HStack, Input, Link, NativeSelect, Progress, Stack, Text } from '@chakra-ui/react';
import { useState, type ChangeEvent } from 'react';
import { LuFileUp } from 'react-icons/lu';

import SimpleCheckbox from '@/components/simple-checkbox';
import SimpleDialog from '@/components/dialogs/simple-dialog';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/hooks/use-error-handler';
import { importLetterboxdFilms, previewLetterboxdFilms, type LetterboxdCandidate, type LetterboxdMatch } from '@/features/user/api/letterboxd-import';
import LetterboxdMatchRow from './letterboxd-match-row';
import { parseLetterboxdExport, type AmbiguousDiaryEntry, type LetterboxdFilm } from './parse-letterboxd-export';

const BATCH_SIZE = 100;
const PREVIEW_SIZE = 20;
type Category = 'watched' | 'watchlist' | 'liked' | 'ratings' | 'diary';
const categories: { value: Category; label: string }[] = [
  { value: 'watched', label: 'Watched movies' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'liked', label: 'Liked movies' },
  { value: 'ratings', label: 'Ratings' },
  { value: 'diary', label: 'Diary watches and rewatches' },
];

const batches = <T extends LetterboxdFilm>(items: T[], size = BATCH_SIZE): T[][] => {
  const result: T[][] = [];
  let group: T[] = [];
  let watches = 0;
  for (const film of items) {
    if (group.length === size || watches + film.watches.length > 2000) {
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
  const [ambiguousDiary, setAmbiguousDiary] = useState<AmbiguousDiaryEntry[]>([]);
  const [diaryAssignments, setDiaryAssignments] = useState<Record<string, string>>({});
  const [skippedDiary, setSkippedDiary] = useState(0);
  const [matches, setMatches] = useState<LetterboxdMatch[]>([]);
  const [choices, setChoices] = useState<Record<string, number | null>>({});
  const [manualCandidates, setManualCandidates] = useState<Record<string, LetterboxdCandidate>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Category[]>(categories.map(({ value }) => value));
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<'matching' | 'importing' | null>(null);
  const [processed, setProcessed] = useState(0);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [visible, setVisible] = useState(50);

  const previewFilms = async (items: LetterboxdFilm[], onBatch?: () => void) => {
    setStage('matching');
    setProcessed(0);
    const found: LetterboxdMatch[] = [];
    let count = 0;
    try {
      for (const group of batches(items, PREVIEW_SIZE)) {
        const next = await previewLetterboxdFilms(group);
        found.push(...next);
        count += group.length;
        setMatches([...found]);
        setChoices((current) => ({ ...current, ...Object.fromEntries(next.map((match) => [match.uri, match.suggestedId])) }));
        setChecked((current) => ({ ...current, ...Object.fromEntries(next.map((match) => [match.uri, match.suggestedId != null])) }));
        setProcessed(count);
        onBatch?.();
      }
    } catch (caught) {
      throw new Error(`Movie matching stopped after ${count} of ${items.length}. ${getApiErrorMessage(caught) ?? (caught instanceof Error ? caught.message : 'Try again.')} You can search unmatched rows manually or upload the ZIP again to retry.`);
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    setComplete(false);
    setFilms([]);
    setAmbiguousDiary([]);
    setDiaryAssignments({});
    setSkippedDiary(0);
    setMatches([]);
    setChoices({});
    setManualCandidates({});
    setChecked({});
    setVisible(50);
    try {
      const parsed = await parseLetterboxdExport(file);
      setFilms(parsed.films);
      setAmbiguousDiary(parsed.ambiguousDiary);
      setOpen(true);
      if (!parsed.ambiguousDiary.length) await previewFilms(parsed.films);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read this Letterboxd export.');
    } finally {
      setBusy(false);
      setStage(null);
    }
  };

  const assignmentOptions = (entry: AmbiguousDiaryEntry, index: number) => [
    ...entry.filmUris,
    ...ambiguousDiary.slice(0, index).filter((previous) => previous.diaryOnly && diaryAssignments[previous.sourceUri] === 'separate' &&
      previous.year === entry.year && previous.title.normalize('NFKC').trim().toLocaleLowerCase() === entry.title.normalize('NFKC').trim().toLocaleLowerCase(),
    ).map((previous) => previous.sourceUri),
  ];
  const assignmentsReady = ambiguousDiary.every((entry, index) => {
    const uri = diaryAssignments[entry.sourceUri];
    return uri === 'skip' || (uri === 'separate' && entry.diaryOnly) || assignmentOptions(entry, index).includes(uri);
  });

  const continueMatching = async () => {
    if (!assignmentsReady) return;
    const resolved = films.map((film) => ({ ...film, watches: [...film.watches] }));
    let skipped = 0;
    for (const [index, entry] of ambiguousDiary.entries()) {
      const uri = diaryAssignments[entry.sourceUri];
      if (uri === 'skip') { skipped += 1; continue; }
      if (uri === 'separate' && entry.diaryOnly) {
        resolved.push({ uri: entry.sourceUri, title: entry.title, year: entry.year, watched: true, watchlist: false,
          liked: false, rating: entry.rating, watches: [{ sourceUri: entry.sourceUri, sourceId: entry.sourceId, watchedOn: entry.watchedOn }] });
        continue;
      }
      const film = resolved.find((item) => item.uri === uri);
      if (!film || !assignmentOptions(entry, index).includes(uri)) return;
      if (film.watches.length >= 200) {
        setError(`Too many diary entries for ${film.title} (200 maximum per movie).`);
        return;
      }
      film.watched = true;
      film.watches.push({ sourceUri: entry.sourceUri, sourceId: entry.sourceId, watchedOn: entry.watchedOn });
      if (film.rating == null) film.rating = entry.rating;
    }
    setBusy(true);
    setError('');
    let completedBatches = 0;
    try {
      await previewFilms(resolved, () => { completedBatches += 1; });
      setFilms(resolved);
      setSkippedDiary(skipped);
      setAmbiguousDiary([]);
    } catch (caught) {
      if (completedBatches > 0) {
        setFilms(resolved);
        setSkippedDiary(skipped);
        setAmbiguousDiary([]);
      }
      setError(caught instanceof Error ? caught.message : 'Could not match these movies.');
    } finally {
      setBusy(false);
      setStage(null);
    }
  };

  const included = films.flatMap((film) => {
    const tmdbId = choices[film.uri];
    if (!checked[film.uri] || tmdbId == null) return [];
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
  const pending = films.filter((film) => checked[film.uri] && choices[film.uri] == null);
  const includedUris = new Set(included.map((film) => film.uri));
  const withoutSelectedData = films.filter((film) => checked[film.uri] && choices[film.uri] != null && !includedUris.has(film.uri));
  const matchByUri = new Map(matches.map((match) => [match.uri, match]));
  const conflicting = included.filter((film) => {
    const mappedId = matchByUri.get(film.uri)?.mappedId;
    return mappedId != null && mappedId !== film.tmdbId;
  });
  const duplicateIds = new Set(included.map((film) => film.tmdbId)).size !== included.length;
  const effects = { existing: 0, unknown: 0, ratingsKept: 0, newWatches: 0, importedWatches: 0 };
  for (const film of included) {
    const match = matchByUri.get(film.uri);
    const previewCandidate = match?.candidates.find((item) => item.id === film.tmdbId);
    const candidate = previewCandidate ?? (manualCandidates[film.uri]?.id === film.tmdbId ? manualCandidates[film.uri] : null);
    if (!previewCandidate) effects.unknown += 1;
    else if (previewCandidate.existing) effects.existing += 1;
    if (film.rating != null && candidate?.ratingKept) effects.ratingsKept += 1;
    if (film.watches.length) {
      effects.importedWatches += match?.importedWatches ?? 0;
      effects.newWatches += film.watches.length - (match?.importedWatches ?? 0);
    }
  }

  const importSelected = async () => {
    if (busy || pending.length || conflicting.length || duplicateIds || !included.length) return;
    setBusy(true);
    setStage('importing');
    setProcessed(0);
    setError('');
    let imported = 0;
    try {
      for (const group of batches(included)) {
        await importLetterboxdFilms(group);
        imported += group.length;
        setProcessed(imported);
      }
      await queryClient.invalidateQueries();
      setCompletedCount(imported);
      setComplete(true);
    } catch (caught) {
      setError(`Import stopped after ${imported} movies. ${caught instanceof Error ? caught.message : 'Please try again.'} Re-importing the same ZIP won't duplicate completed diary entries.`);
    } finally {
      setBusy(false);
      setStage(null);
    }
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap="2">
          <LuFileUp aria-hidden />
          <Heading as="h3" textStyle="subsectionTitle">Import from Letterboxd</Heading>
        </HStack>
        <Text textStyle="supporting" color="fg.muted">
          Choose a Letterboxd export ZIP to review the movies before importing them. Your browser reads the supported CSV files and sends film data to this server for TMDB matching. Profile details and reviews are not sent.
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          <Field.Root>
            <Field.Label>Letterboxd export ZIP</Field.Label>
            <Input type="file" accept=".zip,application/zip" disabled={busy} onChange={handleFile} />
            <Field.HelperText>ZIP, up to 10 MB. Matching can take a while for large libraries.</Field.HelperText>
          </Field.Root>
          {error && !open ? <Text role="alert" color="fg.error" textStyle="supporting">{error}</Text> : null}
          {films.length && !open ? <Button colorPalette="gray" variant="outline" onClick={() => setOpen(true)}>Return to import review</Button> : null}
          {complete && !open ? <Text role="status">Import complete: {completedCount} {completedCount === 1 ? 'movie' : 'movies'} processed.</Text> : null}
        </Stack>
      </Card.Body>
      <SimpleDialog
        open={open}
        onOpenChange={(details) => { if (!busy) setOpen(details.open); }}
        closeButton={!busy}
        size="full"
        scrollBehavior="inside"
        title="Review Letterboxd import"
        contentProps={{ maxH: '100dvh', maxW: '100%', w: '100%', py: 0 }}
        bodyProps={{ px: { base: 3, md: 6 } }}
      >
        <Stack gap="5" maxW="6xl" mx="auto" pb="6">
          {stage ? (
            <Stack gap="2" role="status">
              <Text textStyle="supporting">{stage === 'matching' ? 'Matching' : 'Importing'} {processed} of {stage === 'matching' ? films.length : included.length} movies{busy && processed < (stage === 'matching' ? films.length : included.length) ? ' (working on the next batch)' : ''}</Text>
              <Progress.Root value={stage === 'matching' ? processed : null} max={stage === 'matching' ? films.length : included.length} colorPalette="brand">
                <Progress.Track aria-label={stage === 'matching' ? 'Matching movies' : 'Importing movies'}><Progress.Range /></Progress.Track>
              </Progress.Root>
            </Stack>
          ) : null}
          {error ? <Text role="alert" color="fg.error" textStyle="supporting">{error}</Text> : null}
          {!stage && ambiguousDiary.length && !matches.length ? (
            <Stack gap="4">
              <Heading as="h3" textStyle="sectionTitle">Assign diary viewings</Heading>
              <Text textStyle="supporting">These diary entries share a title and year with more than one Letterboxd film. Choose the film for each viewing or explicitly skip it. Check the film links if you are unsure.</Text>
              {ambiguousDiary.map((entry, index) => (
                <Field.Root key={`${entry.sourceUri}:${entry.sourceId}`}>
                  <Field.Label>Diary entry {index + 1}: film for {entry.title} ({entry.year}) viewing on {entry.watchedOn ?? 'an unknown date'}</Field.Label>
                  <HStack gap="3" flexWrap="wrap">
                    <Link href={entry.sourceUri} target="_blank" rel="noopener noreferrer" textStyle="supporting">View diary entry {index + 1}</Link>
                    {assignmentOptions(entry, index).map((uri) => <Link key={uri} href={uri} target="_blank" rel="noopener noreferrer" textStyle="supporting">View candidate {uri}</Link>)}
                  </HStack>
                  <NativeSelect.Root colorPalette="brand">
                    <NativeSelect.Field value={diaryAssignments[entry.sourceUri] ?? ''} onChange={(change) => setDiaryAssignments((current) => ({ ...current, [entry.sourceUri]: change.target.value }))}>
                      <option value="">Choose a film or skip this viewing</option>
                      {assignmentOptions(entry, index).map((uri) => <option key={uri} value={uri}>{uri}</option>)}
                      {entry.diaryOnly ? <option value="separate">Keep as a separate movie</option> : null}
                      <option value="skip">Skip this viewing</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
              ))}
              <Button colorPalette="brand" disabled={busy || !assignmentsReady} onClick={continueMatching}>Continue to movie matching</Button>
            </Stack>
          ) : null}
          {!stage && films.length && !ambiguousDiary.length ? (
            <>
              <Text textStyle="supporting" color="fg.muted">Check each entry you want to import, then choose its TMDB movie. Unchecked entries are skipped.</Text>
              {matches.some((match) => match.mappingConflict) ? <Text role="alert" textStyle="supporting" color="fg.error">Previously imported films with conflicting TMDB matches cannot be re-imported. They are left unchecked; the other films remain available.</Text> : null}
              <Stack gap="2">
                <Heading as="h3" textStyle="cardTitle">What to import</Heading>
                <HStack gap="4" flexWrap="wrap">
                  {categories.map(({ value, label }) => (
                    <SimpleCheckbox key={value} checked={selected.includes(value)} disabled={busy || complete}
                      onCheckedChange={(details) => setSelected((current) => details.checked === true ? [...current, value] : current.filter((item) => item !== value))}
                      label={label} />
                  ))}
                </HStack>
              </Stack>
              <Stack gap="3">
                <Heading as="h3" textStyle="cardTitle">Movie matches ({films.length})</Heading>
                {films.slice(0, visible).map((film) => (
                  <LetterboxdMatchRow key={film.uri} film={film} match={matchByUri.get(film.uri)} manualCandidate={manualCandidates[film.uri]} choice={choices[film.uri] ?? null}
                    checked={checked[film.uri] ?? false} disabled={busy || complete}
                    onChecked={(value) => setChecked((current) => ({ ...current, [film.uri]: value }))}
                    onChoice={(candidate: LetterboxdCandidate | null) => {
                      setChoices((current) => ({ ...current, [film.uri]: candidate?.id ?? null }));
                      if (candidate) setManualCandidates((current) => ({ ...current, [film.uri]: candidate }));
                    }} />
                ))}
                {films.length > visible ? <Button colorPalette="gray" variant="outline" onClick={() => setVisible((count) => count + 50)}>Show more movies</Button> : null}
              </Stack>
              <Stack gap="2" position="sticky" bottom="0" bg="bg.panel" p="4" borderWidth="1px" borderColor="border.subtle" borderRadius="lg">
                <Text textStyle="body">{included.length} to import · {films.length - included.length} skipped</Text>
                {skippedDiary ? <Text textStyle="supporting" color="fg.muted">{skippedDiary} diary {skippedDiary === 1 ? 'viewing' : 'viewings'} skipped by choice.</Text> : null}
                {withoutSelectedData.length ? <Text textStyle="supporting" color="fg.muted">{withoutSelectedData.length} checked {withoutSelectedData.length === 1 ? 'entry has' : 'entries have'} no data in the chosen categories and will be skipped.</Text> : null}
                {pending.length ? <Text role="alert" textStyle="supporting" color="fg.error">{pending.length} checked {pending.length === 1 ? 'entry needs' : 'entries need'} a TMDB movie. Choose a match or uncheck them.</Text> : null}
                {conflicting.length ? <Text role="alert" textStyle="supporting" color="fg.error">{conflicting.length} previously imported {conflicting.length === 1 ? 'match differs' : 'matches differ'}. Choose the original movie or uncheck the entry.</Text> : null}
                {duplicateIds ? <Text role="alert" textStyle="supporting" color="fg.error">Two entries point to the same TMDB movie. Uncheck one or choose a different match.</Text> : null}
                {included.length ? <Text textStyle="supporting">
                  {effects.unknown ? 'Known matches: ' : ''}{included.length - effects.existing - effects.unknown} new, {effects.existing} already tracked.
                  {effects.unknown ? ` ${effects.unknown} manually chosen ${effects.unknown === 1 ? 'movie may' : 'movies may'} already be tracked.` : ''}
                  {' '}{effects.ratingsKept} existing ratings kept.
                  {selected.includes('diary') ? ` ${effects.newWatches} new diary watches, ${effects.importedWatches} already imported.` : ''}
                </Text> : null}
                <Text textStyle="supporting" color="fg.muted">Movies only: the ZIP does not reliably identify TV entries, so skip series. Reviews, tags, lists, deleted entries and profile details are not imported. Existing ratings stay; watched movies without diary dates get no invented date. An interrupted import may have completed earlier batches.</Text>
                {complete ? <Text role="status">Import complete: {completedCount} {completedCount === 1 ? 'movie' : 'movies'} processed. {films.length - completedCount} skipped.</Text> : (
                  <Button colorPalette="brand" disabled={busy || !included.length || pending.length > 0 || conflicting.length > 0 || duplicateIds} onClick={importSelected}>
                    Import {included.length} {included.length === 1 ? 'movie' : 'movies'}
                  </Button>
                )}
              </Stack>
            </>
          ) : null}
        </Stack>
      </SimpleDialog>
    </Card.Root>
  );
};

export default LetterboxdImportSection;
