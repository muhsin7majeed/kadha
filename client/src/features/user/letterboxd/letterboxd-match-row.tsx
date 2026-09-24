import { Box, Combobox, Field, Grid, Image, Stack, Text, createListCollection } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import SimpleCheckbox from '@/components/simple-checkbox';
import useSearchMedia from '@/features/media/api/use-search-media';
import type { LetterboxdCandidate, LetterboxdMatch } from '@/features/user/api/letterboxd-import';
import type { LetterboxdFilm } from './parse-letterboxd-export';

interface Props {
  film: LetterboxdFilm;
  match?: LetterboxdMatch;
  manualCandidate?: LetterboxdCandidate;
  choice: number | null;
  checked: boolean;
  disabled: boolean;
  onChoice: (candidate: LetterboxdCandidate | null) => void;
  onChecked: (checked: boolean) => void;
}

const LetterboxdMatchRow = ({ film, match, manualCandidate, choice, checked, disabled, onChoice, onChecked }: Props) => {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<LetterboxdCandidate | null>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(input.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [input]);
  const results = useSearchMedia('movie', search, 1, search.length >= 2 && !disabled);
  const searched = results.data?.data.flatMap((media): LetterboxdCandidate[] => media.media_type === 'movie' ? [{
    id: media.media_id, title: media.title, year: Number(media.release_date?.slice(0, 4)) || null,
    posterPath: media.poster_path, existing: Boolean(media.watched || media.watchlist || media.liked), ratingKept: media.rating != null,
  }] : []) ?? [];
  const candidates = search.length >= 2 ? searched : match?.candidates ?? [];
  const options = [...candidates];
  if (choice != null && !options.some((item) => item.id === choice)) {
    const saved = selectedCandidate?.id === choice ? selectedCandidate : manualCandidate?.id === choice ? manualCandidate : match?.candidates.find((item) => item.id === choice);
    if (saved) options.unshift(saved);
  }
  const collection = createListCollection({
    items: options,
    itemToString: (item) => `${item.title} (${item.year ?? 'year unknown'}) · TMDB movie #${item.id}`,
    itemToValue: (item) => String(item.id),
  });
  const chosen = selectedCandidate?.id === choice ? selectedCandidate : manualCandidate?.id === choice ? manualCandidate : match?.candidates.find((item) => item.id === choice);
  const poster = chosen?.posterPath;
  const blocked = match?.mappedId != null && choice != null && match.mappedId !== choice;

  return (
    <Grid as="article" templateColumns={{ base: '56px minmax(0, 1fr)', md: '64px minmax(0, 1fr) minmax(220px, 1fr)' }} gap="3" p="3" borderWidth="1px" borderColor="border.subtle" borderRadius="lg" alignItems="start">
      <Image src={poster ? `https://image.tmdb.org/t/p/w185${poster}` : '/assets/images/image-placeholder.svg'} alt={poster ? `${chosen?.title ?? film.title} poster` : ''} w="full" aspectRatio="2 / 3" objectFit="cover" borderRadius="md" />
      <Stack gap="1" minW="0">
        <SimpleCheckbox label={`Include ${film.title} (${film.year})`} checked={checked} disabled={disabled} onCheckedChange={(details) => onChecked(details.checked === true)} />
        <Text textStyle="supporting" color="fg.muted">Letterboxd · {film.title} ({film.year})</Text>
        {checked && choice == null ? <Text textStyle="supporting" color="fg.warning">Choose a TMDB movie to include this entry.</Text> : null}
        {match?.error ? <Text textStyle="supporting" color="fg.error">Initial match failed. Search for a movie below or leave this unchecked.</Text> : null}
        {blocked ? <Text textStyle="supporting" color="fg.error">Previously imported as TMDB movie #{match.mappedId}. Choose that movie or uncheck this entry.</Text> : null}
      </Stack>
      <Box gridColumn={{ base: '1 / -1', md: 'auto' }} minW="0">
        <Field.Root>
          <Field.Label>TMDB movie for {film.title} ({film.year})</Field.Label>
          <Combobox.Root collection={collection} value={choice == null ? [] : [String(choice)]} onValueChange={(details) => {
            const candidate = options.find((item) => String(item.id) === details.value[0]) ?? null;
            setSelectedCandidate(candidate);
            onChoice(candidate);
          }} onInputValueChange={(details) => {
            setInput(details.reason === 'input-change' ? details.inputValue : '');
            if (details.reason === 'input-change' && choice != null) {
              setSelectedCandidate(null);
              onChoice(null);
            }
          }} disabled={disabled} openOnClick>
            <Combobox.Control>
              <Combobox.Input placeholder="Search TMDB movies" />
              <Combobox.IndicatorGroup><Combobox.ClearTrigger /><Combobox.Trigger /></Combobox.IndicatorGroup>
            </Combobox.Control>
            <Combobox.Positioner><Combobox.Content><Combobox.Empty>{results.isFetching ? 'Searching…' : results.isError ? 'TMDB search failed. Try again.' : 'No movies found. Try another title.'}</Combobox.Empty>
                {collection.items.map((candidate) => <Combobox.Item key={candidate.id} item={candidate}>
                  <Stack gap="0"><Combobox.ItemText>{candidate.title} ({candidate.year ?? 'year unknown'})</Combobox.ItemText><Text textStyle="compact" color="fg.muted">TMDB movie #{candidate.id}</Text></Stack>
                  <Combobox.ItemIndicator />
                </Combobox.Item>)}
            </Combobox.Content></Combobox.Positioner>
          </Combobox.Root>
        </Field.Root>
      </Box>
    </Grid>
  );
};

export default LetterboxdMatchRow;
