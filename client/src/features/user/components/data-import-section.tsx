import { Button, Card, Field, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { LuFileUp, LuUpload } from 'react-icons/lu';

import useImportUserData from '@/features/user/api/use-import-user-data';
import usePreviewUserImport from '@/features/user/api/use-preview-user-import';
import type { ImportCategory, UserImportPayload, UserImportPreview } from '@/features/user/user-import.types';
import { toaster } from '@/components/ui/toaster-store';
import SimpleCheckbox from '@/components/simple-checkbox';

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
    description: 'Replaces privacy, region, and navigation settings.',
  },
  {
    value: 'mediaTracking',
    label: 'Media tracking',
    description: 'Adds or updates tracking data.',
  },
  {
    value: 'watchHistory',
    label: 'Watch history',
    description: 'Adds watches and rewatches.',
  },
  {
    value: 'collections',
    label: 'Collections',
    description: 'Creates missing collections and adds items.',
  },
  {
    value: 'recommendationSettings',
    label: 'Recommendation settings',
    description: 'Replaces current settings.',
  },
  {
    value: 'recommendationFeedback',
    label: 'Recommendation feedback',
    description: 'Adds feedback.',
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

const pluralize = (count: number, singular: string) => `${count} ${count === 1 ? singular : `${singular}s`}`;

const getCategoryLabel = (preview: UserImportPreview, category: ImportCategory, label: string) => {
  if (category === 'accountPreferences' || category === 'recommendationSettings') return label;
  if (category === 'collections') {
    return `${label} (${pluralize(preview.importable.collections, 'collection')}, ${pluralize(
      preview.importable.collectionItems,
      'item',
    )})`;
  }
  return `${label} (${getCategoryCount(preview, category)})`;
};

const formatList = (items: string[]) => {
  if (items.length < 2) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

const getUnsupportedLabels = (preview: UserImportPreview) => {
  const labels: string[] = [];
  if (preview.unsupported.friendships > 0) labels.push('friends');
  if (preview.unsupported.collectionMemberships + preview.unsupported.collectionInvites > 0) {
    labels.push('shared collection access');
  }
  if (preview.unsupported.notifications > 0) labels.push('notifications');
  if (preview.unsupported.activity > 0) labels.push('activity');
  return labels;
};

const DataImportSection = ({ headingAs = 'h2' }: DataImportSectionProps) => {
  const [payload, setPayload] = useState<UserImportPayload | null>(null);
  const [selected, setSelected] = useState<ImportCategory[]>([]);
  const { mutate: previewImport, data: preview, isPending: isPreviewing, reset: resetPreview } = usePreviewUserImport();
  const { mutate: importData, isPending: isImporting } = useImportUserData();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPayload(null);
    setSelected([]);
    resetPreview();
    if (!file) return;

    try {
      const nextPayload = await parseImportFile(file);
      setPayload(nextPayload);
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
  const unsupportedLabels = preview ? getUnsupportedLabels(preview) : [];

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
          Choose a Kadha export to see what can be imported. Some things can be imported, some, not so much. Like
          friendship, which is less portable.
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          <Field.Root>
            <Field.Label>Kadha export</Field.Label>
            <Input type="file" accept="application/json,.json" onChange={handleFileChange} />
            <Field.HelperText>JSON, up to 10 MB.</Field.HelperText>
          </Field.Root>

          {preview ? (
            <Stack gap="4">
              {preview.source.username ? (
                <Text color="fg.muted" textStyle="supporting">
                  From {preview.source.username}
                </Text>
              ) : null}
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
                      <SimpleCheckbox
                        key={option.value}
                        checked={checked}
                        onCheckedChange={(details) => toggleCategory(option.value, details.checked === true)}
                        label={getCategoryLabel(preview, option.value, option.label)}
                        description={option.description}
                      />
                    );
                  })}
              </SimpleGrid>
              {unsupportedLabels.length > 0 ? (
                <Text color="fg.muted" textStyle="supporting">
                  Not imported: {formatList(unsupportedLabels)}.
                </Text>
              ) : null}
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
            Import
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default DataImportSection;
