import { Box, Button, Field, HStack, Input, Stack, Textarea, chakra } from '@chakra-ui/react';
import { FormEvent, useEffect, useId, useState } from 'react';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import useAddToLiked from '@/features/user-media/api/use-add-to-liked';
import useAddToWatched from '@/features/user-media/api/use-add-to-watched';
import useAddToWatchList from '@/features/user-media/api/use-add-to-watch-list';
import { MediaAction, UserMediaPayload } from '@/features/user-media/user-media.types';
import { MediaMeta } from '@/types/common';
import { getMediaTrackingDetailsUpdate, type MediaTrackingDetailsUpdate } from '../utils/media-tracking-details';
import RatingInput from './rating-input';

type TrackingContext = 'card-post-action' | 'detail-pre-action';
type NoteField = 'likedNote' | 'watchedNote' | 'watchlistNote';

interface MediaTrackingDialogProps {
  action: MediaAction;
  context: TrackingContext;
  currentState?: MediaMeta;
  media: UserMediaPayload;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (details: MediaTrackingDetailsUpdate) => void;
}

const noteFieldByAction: Record<MediaAction, NoteField> = {
  liked: 'likedNote',
  watched: 'watchedNote',
  watchlist: 'watchlistNote',
};

const notePlaceholderByAction: Record<MediaAction, string> = {
  liked: 'What did you like about it?',
  watched: 'What do you want to remember?',
  watchlist: 'Why do you want to watch this?',
};

const dialogTitleByAction: Record<MediaAction, string> = {
  liked: 'Like this title',
  watched: 'Mark watched',
  watchlist: 'Add to watchlist',
};

const getLocalDateOnly = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 10);
};

const hasField = <T extends object, Key extends PropertyKey>(value: T | undefined, key: Key) =>
  Boolean(value && Object.prototype.hasOwnProperty.call(value, key));

const getKnownValue = <Key extends keyof UserMediaPayload & keyof MediaMeta>(
  media: UserMediaPayload,
  currentState: MediaMeta | undefined,
  key: Key,
) => currentState?.[key] ?? media[key];

const hasKnownValue = <Key extends keyof UserMediaPayload & keyof MediaMeta>(
  media: UserMediaPayload,
  currentState: MediaMeta | undefined,
  key: Key,
) => hasField(currentState, key) || hasField(media, key);

const savedTrackingToast = () => ({
  title: 'Saved tracking details',
});

const MediaTrackingDialog = ({
  action,
  context,
  currentState,
  media,
  open,
  onOpenChange,
  onSaved,
}: MediaTrackingDialogProps) => {
  const formId = useId();
  const today = getLocalDateOnly();
  const noteField = noteFieldByAction[action];
  const [rating, setRating] = useState<number | null>(null);
  const [ratingDirty, setRatingDirty] = useState(false);
  const [note, setNote] = useState('');
  const [noteDirty, setNoteDirty] = useState(false);
  const [watchedOn, setWatchedOn] = useState(today);
  const [watchedOnDirty, setWatchedOnDirty] = useState(false);
  const [likeToo, setLikeToo] = useState(false);
  const [alsoMarkWatched, setAlsoMarkWatched] = useState(false);
  const likedMutation = useAddToLiked({ getToast: savedTrackingToast });
  const watchedMutation = useAddToWatched({ getToast: savedTrackingToast });
  const watchlistMutation = useAddToWatchList({ getToast: savedTrackingToast });
  const mutation = action === 'liked' ? likedMutation : action === 'watched' ? watchedMutation : watchlistMutation;
  const isPending = mutation.isPending;
  const knownRating = hasKnownValue(media, currentState, 'rating');
  const knownNote = hasKnownValue(media, currentState, noteField);
  const knownWatchedOn = hasKnownValue(media, currentState, 'watchedOn');
  const isAlreadyWatched = Boolean(getKnownValue(media, currentState, 'watched'));
  const showRating = action === 'liked' || action === 'watched';
  const showWatchedOn = action === 'watched';
  const showLikeToo = action === 'watched';
  const showAlsoMarkWatched = action === 'liked' && !isAlreadyWatched;

  useEffect(() => {
    if (!open) return;

    setRating(getKnownValue(media, currentState, 'rating') ?? null);
    setRatingDirty(false);
    setNote((getKnownValue(media, currentState, noteField) as string | null | undefined) ?? '');
    setNoteDirty(false);
    setWatchedOn(getKnownValue(media, currentState, 'watchedOn') ?? today);
    setWatchedOnDirty(false);
    setLikeToo(Boolean(getKnownValue(media, currentState, 'liked')));
    setAlsoMarkWatched(false);
  }, [action, currentState, media, noteField, open, today]);

  const handleRatingChange = (value: number | null) => {
    setRating(value);
    setRatingDirty(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const payload: UserMediaPayload = {
      ...media,
      [action]: true,
    };

    if (showRating && (ratingDirty || knownRating)) {
      payload.rating = rating;
    }

    if (noteDirty || knownNote) {
      payload[noteField] = note.trim() || null;
    }

    if (showWatchedOn && (watchedOnDirty || knownWatchedOn || context === 'detail-pre-action')) {
      payload.watchedOn = watchedOn || null;
    }

    if (showLikeToo) {
      payload.liked = likeToo;
    }

    if (showAlsoMarkWatched && alsoMarkWatched) {
      payload.watched = true;
    }

    try {
      await mutation.mutateAsync(payload);
      onSaved?.(getMediaTrackingDetailsUpdate(payload));
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <SimpleDialog
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title={dialogTitleByAction[action]}
      closeButton
      contentProps={{ width: { base: 'calc(100vw - 2rem)', md: 'lg' }, maxW: 'lg' }}
      footer={
        <HStack gap="3" justify="flex-end" width="full">
          <Button variant="outline" colorPalette="gray" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} colorPalette="brand" loading={isPending} disabled={isPending}>
            Save
          </Button>
        </HStack>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <Stack gap="5">
          {showWatchedOn && (
            <Field.Root>
              <Field.Label>Watched on</Field.Label>
              <Input
                type="date"
                max={today}
                value={watchedOn}
                disabled={isPending}
                onChange={(event) => {
                  setWatchedOn(event.target.value);
                  setWatchedOnDirty(true);
                }}
              />
            </Field.Root>
          )}

          {showRating && (
            <Field.Root>
              <Field.Label>Your rating</Field.Label>
              <RatingInput value={rating} disabled={isPending} onChange={handleRatingChange} />
            </Field.Root>
          )}

          <Field.Root>
            <Field.Label>Private note</Field.Label>
            <Textarea
              value={note}
              maxLength={500}
              placeholder={notePlaceholderByAction[action]}
              disabled={isPending}
              onChange={(event) => {
                setNote(event.target.value);
                setNoteDirty(true);
              }}
            />
          </Field.Root>

          {showLikeToo && (
            <HStack as="label" gap="2" cursor={isPending ? 'not-allowed' : 'pointer'} align="center">
              <chakra.input
                type="checkbox"
                checked={likeToo}
                disabled={isPending}
                width="4"
                height="4"
                accentColor="brand.solid"
                onChange={(event) => setLikeToo(event.currentTarget.checked)}
              />
              <Box as="span">Like this too</Box>
            </HStack>
          )}

          {showAlsoMarkWatched && (
            <HStack as="label" gap="2" cursor={isPending ? 'not-allowed' : 'pointer'} align="center">
              <chakra.input
                type="checkbox"
                checked={alsoMarkWatched}
                disabled={isPending}
                width="4"
                height="4"
                accentColor="brand.solid"
                onChange={(event) => setAlsoMarkWatched(event.currentTarget.checked)}
              />
              <Box as="span">Also mark watched</Box>
            </HStack>
          )}
        </Stack>
      </form>
    </SimpleDialog>
  );
};

export default MediaTrackingDialog;
