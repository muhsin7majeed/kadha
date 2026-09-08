import { Box, Button, Card, Checkbox, Field, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { LuFileUp, LuUpload } from 'react-icons/lu';

import useImportUserData from '@/features/user/api/use-import-user-data';
import usePreviewUserImport from '@/features/user/api/use-preview-user-import';
import type { ImportCategory, UserImportPayload, UserImportPreview } from '@/features/user/user-import.types';
import { toaster } from '@/components/ui/toaster-store';

interface DataImportSectionProps {
  headingAs?: 'h2' | 'h3';
}

const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024 - 1024;

const importOptions: Array<{
  value: ImportCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'accountPreferences',
    label: 'Account preferences',
    description: 'Replace privacy settings and watch region. Your username is not changed.',
  },
  {
    value: 'mediaTracking',
    label: 'Media tracking',
    description: 'Merge liked, watched, watchlist, ratings, dates, and personal notes.',
  },
  {
    value: 'watchHistory',
    label: 'Watch history',
    description: 'Add movie watches, rewatches, and TV episode watches.',
  },
  {
    value: 'collections',
    label: 'Owned collections',
    description: 'Create owned collections and add their items.',
  },
  {
    value: 'recommendationSettings',
    label: 'Recommendation settings',
    description: 'Replace recommendation signal preferences.',
  },
  {
    value: 'recommendationFeedback',
    label: 'Recommendation feedback',
    description: 'Add more-like-this, less-like-this, and hidden-title feedback.',
  },
];

const parseImportFile = async (file: File): Promise<UserImportPayload> => {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error('Choose a Kadha export smaller than 10 MB.');
  }
  const parsed = JSON.parse(await file.text()) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Choose a Kadha JSON export file.');
  }
  return { export: parsed as Record<string, unknown> };
};

const getCategoryCount = (preview: UserImportPreview, category: ImportCategory) => {
  if (category === 'accountPreferences') return preview.importable.accountPreferences;
  if (category === 'mediaTracking') return preview.importable.media;
  if (category === 'watchHistory') return preview.importable.watchEvents;
  if (category === 'collections') return preview.importable.collections;
  if (category === 'recommendationSettings') return preview.importable.recommendationSettings;
  return preview.importable.recommendationFeedback;
};

const DataImportSection = ({ headingAs = 'h2' }: DataImportSectionProps) => {
  const [payload, setPayload] = useState<UserImportPayload | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selected, setSelected] = useState<ImportCategory[]>([]);
  const { mutate: previewImport, data: preview, isPending: isPreviewing, reset: resetPreview } = usePreviewUserImport();
  const { mutate: importData, isPending: isImporting } = useImportUserData();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPayload(null);
    setFileName(null);
    setSelected([]);
    resetPreview();
    if (!file) return;

    try {
      const nextPayload = await parseImportFile(file);
      setPayload(nextPayload);
      setFileName(file.name);
      previewImport(nextPayload, {
        onSuccess: (result) =>
          setSelected(result.availableCategories.filter((category) => category !== 'accountPreferences')),
      });
    } catch (error) {
      toaster.error({
        title: error instanceof Error ? error.message : 'Could not read import file',
      });
    }
  };

  const toggleCategory = (category: ImportCategory, checked: boolean) => {
    setSelected((current) => (checked ? [...current, category] : current.filter((item) => item !== category)));
  };
  const unsupportedTotal = preview ? Object.values(preview.unsupported).reduce((total, count) => total + count, 0) : 0;

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap="2">
          <LuFileUp aria-hidden />
          <Heading as={headingAs} textStyle="subsectionTitle">
            Import
          </Heading>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          Preview a Kadha JSON export, then choose which supported data to add to this account.
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          <Field.Root>
            <Field.Label>Export file</Field.Label>
            <Input type="file" accept="application/json,.json" onChange={handleFileChange} />
            <Field.HelperText>
              {fileName ? `Selected: ${fileName}` : 'Choose a Kadha JSON export up to 10 MB.'}
            </Field.HelperText>
          </Field.Root>

          {preview ? (
            <Stack gap="4">
              <Text color="fg.muted" textStyle="supporting">
                Source: {preview.source.username ?? 'Unknown user'} · Imported records will belong to this account.
              </Text>
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  onClick={() => setSelected(preview.availableCategories)}
                >
                  Select all
                </Button>
                <Button size="sm" variant="ghost" colorPalette="gray" onClick={() => setSelected([])}>
                  Clear all
                </Button>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                {importOptions
                  .filter((option) => preview.availableCategories.includes(option.value))
                  .map((option) => {
                    const checked = selected.includes(option.value);
                    return (
                      <Checkbox.Root
                        key={option.value}
                        checked={checked}
                        onCheckedChange={(details) => toggleCategory(option.value, details.checked === true)}
                        alignItems="flex-start"
                        borderWidth="1px"
                        borderColor={checked ? 'brand.solid' : 'border.muted'}
                        bg={checked ? 'brand.subtle' : 'transparent'}
                        borderRadius="lg"
                        p="4"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control mt="0.5" />
                        <Box>
                          <Checkbox.Label fontWeight="medium">
                            {option.label} ({getCategoryCount(preview, option.value)})
                          </Checkbox.Label>
                          <Text color="fg.muted" textStyle="supporting" mt="1">
                            {option.description}
                          </Text>
                        </Box>
                      </Checkbox.Root>
                    );
                  })}
              </SimpleGrid>
              {preview.importable.collectionItems > 0 && selected.includes('collections') ? (
                <Text color="fg.muted" textStyle="supporting">
                  Selected collections contain {preview.importable.collectionItems} items.
                </Text>
              ) : null}
              {unsupportedTotal > 0 ? (
                <Box borderWidth="1px" borderRadius="md" p="3">
                  <Text fontWeight="medium" textStyle="body">
                    Included for reference only
                  </Text>
                  <Text color="fg.muted" textStyle="supporting">
                    {preview.unsupported.friendships} friendships, {preview.unsupported.collectionMemberships}{' '}
                    memberships, {preview.unsupported.collectionInvites} invitations,{' '}
                    {preview.unsupported.notifications} notifications, and {preview.unsupported.activity} activity items
                    cannot be imported.
                  </Text>
                </Box>
              ) : null}
              <Text color="fg.muted" textStyle="supporting">
                Watch history can move between accounts. Friendships are less portable.
              </Text>
              <Text color="fg.muted" textStyle="supporting">
                Importing never changes your username, role, account ID, password, recovery code, or sessions.
              </Text>
            </Stack>
          ) : null}

          <Button
            alignSelf={{ base: 'stretch', md: 'flex-start' }}
            colorPalette="brand"
            loading={isImporting}
            disabled={!payload || !preview || selected.length === 0 || isPreviewing || isImporting}
            onClick={() => payload && importData({ ...payload, options: { categories: selected } })}
          >
            <LuUpload />
            Import selected data
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default DataImportSection;
