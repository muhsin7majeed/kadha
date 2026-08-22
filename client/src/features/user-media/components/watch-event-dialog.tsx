import { Button, Field, HStack, Input, Stack, Textarea } from '@chakra-ui/react';
import { FormEvent, useEffect, useId, useState } from 'react';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import type { UserMediaPayload, WatchEvent, WatchEventDetails } from '../user-media.types';
import { useCreateWatchEvent, useUpdateWatchEvent } from '../api/use-watch-event-mutations';
import RatingInput from './rating-input';

interface WatchEventDialogProps {
  event?: WatchEvent | null;
  media: UserMediaPayload;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const getLocalDateOnly = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 10);
};

const createClientRequestId = (mediaId: number) =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${mediaId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const WatchEventDialog = ({ event, media, onOpenChange, open }: WatchEventDialogProps) => {
  const formId = useId();
  const today = getLocalDateOnly();
  const [watchedOn, setWatchedOn] = useState(today);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [ratingDirty, setRatingDirty] = useState(false);
  const [clientRequestId, setClientRequestId] = useState(() => createClientRequestId(media.media_id));
  const identity = { mediaId: media.media_id, mediaType: media.media_type };
  const createEvent = useCreateWatchEvent(identity);
  const updateEvent = useUpdateWatchEvent(identity);
  const isEditing = Boolean(event);
  const isPending = createEvent.isPending || updateEvent.isPending;

  useEffect(() => {
    if (!open) return;

    setWatchedOn(event ? (event.watchedOn ?? '') : today);
    setNote(event?.note ?? '');
    setRating(media.rating ?? null);
    setRatingDirty(false);
    setClientRequestId(createClientRequestId(media.media_id));
  }, [event, media.media_id, media.rating, open, today]);

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    if (isPending) return;

    const details: WatchEventDetails = {
      watchedOn: watchedOn || null,
      note: note.trim() || null,
      ...(ratingDirty || media.rating !== undefined ? { rating } : {}),
    };

    try {
      if (event) {
        await updateEvent.mutateAsync({ eventId: event.id, payload: details });
      } else {
        await createEvent.mutateAsync({ ...media, ...details, clientRequestId });
      }

      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <SimpleDialog
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title={isEditing ? 'Edit watch' : media.watchCount ? 'Log a rewatch' : 'Mark watched'}
      closeButton
      contentProps={{ width: { base: 'calc(100vw - 2rem)', md: 'lg' }, maxW: 'lg' }}
      footer={
        <HStack gap="3" justify="flex-end" width="full">
          <Button variant="outline" colorPalette="gray" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} colorPalette="blue" loading={isPending} disabled={isPending}>
            {isEditing ? 'Save changes' : media.watchCount ? 'Log rewatch' : 'Mark watched'}
          </Button>
        </HStack>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <Stack gap="5">
          <Field.Root>
            <Field.Label>Watched on</Field.Label>
            <Input
              type="date"
              max={today}
              value={watchedOn}
              disabled={isPending}
              onChange={(changeEvent) => setWatchedOn(changeEvent.target.value)}
            />
            <Field.HelperText>Leave this blank if you do not remember the date.</Field.HelperText>
          </Field.Root>

          <Field.Root>
            <Field.Label>Your current rating</Field.Label>
            <RatingInput
              value={rating}
              disabled={isPending}
              onChange={(value) => {
                setRating(value);
                setRatingDirty(true);
              }}
            />
            <Field.HelperText>This rating applies to the title overall, not only this viewing.</Field.HelperText>
          </Field.Root>

          <Field.Root>
            <Field.Label>Private watch note</Field.Label>
            <Textarea
              value={note}
              maxLength={500}
              minH="28"
              placeholder="What stood out this time?"
              disabled={isPending}
              onChange={(changeEvent) => setNote(changeEvent.target.value)}
            />
            <Field.HelperText>Only you can see this note.</Field.HelperText>
          </Field.Root>
        </Stack>
      </form>
    </SimpleDialog>
  );
};

export default WatchEventDialog;
