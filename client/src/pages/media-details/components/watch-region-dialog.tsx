import { Button, Dialog, Field, NativeSelect } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuMapPin } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import { WATCH_REGIONS } from '@/constants/watch-regions';
import useUpdateMe from '@/features/user/api/use-update-me';
import type { User } from '@/features/user/user.types';
import { getUpdateUserPayload } from '@/features/user/user-settings';

interface WatchRegionDialogProps {
  currentRegion: string;
  me?: User;
}

const WatchRegionDialog = ({ currentRegion, me }: WatchRegionDialogProps) => {
  const { mutateAsync: updateMe, isPending } = useUpdateMe();
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(currentRegion);

  useEffect(() => {
    if (open) {
      setSelectedRegion(currentRegion);
    }
  }, [currentRegion, open]);

  const saveRegion = async () => {
    if (!me || isPending) return;

    await updateMe({
      ...getUpdateUserPayload(me),
      watchRegion: selectedRegion,
    });
    setOpen(false);
  };

  return (
    <SimpleDialog
      open={open}
      onOpenChange={(event) => setOpen(event.open)}
      title="Watch region"
      trigger={
        <Button variant="outline" colorPalette="brand" size="xs">
          <LuMapPin />
          Change region
        </Button>
      }
      footer={
        <>
          <Dialog.ActionTrigger asChild>
            <Button variant="outline" colorPalette="gray">
              Cancel
            </Button>
          </Dialog.ActionTrigger>
          <Button colorPalette="brand" onClick={saveRegion} loading={isPending} disabled={!me || isPending}>
            Save
          </Button>
        </>
      }
    >
      <Field.Root required>
        <Field.Label>Country</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
            autoFocus
          >
            {WATCH_REGIONS.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.HelperText>
          {me
            ? 'Choose the country used for streaming availability.'
            : 'Your profile could not be loaded, so the region cannot be saved right now.'}
        </Field.HelperText>
      </Field.Root>
    </SimpleDialog>
  );
};

export default WatchRegionDialog;
