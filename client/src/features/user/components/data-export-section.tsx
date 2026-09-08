import { Button, Card, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuDownload } from 'react-icons/lu';

import useExportUserData from '@/features/user/api/use-export-user-data';
import type { ExportCategory } from '@/features/user/user-import.types';
import SimpleCheckbox from '@/components/simple-checkbox';

interface DataExportSectionProps {
  headingAs?: 'h2' | 'h3';
}

const exportOptions: Array<{
  value: ExportCategory;
  label: string;
  description?: string;
}> = [
  {
    value: 'accountPreferences',
    label: 'Account & preferences',
    description: 'Profile, privacy, and region.',
  },
  {
    value: 'mediaTracking',
    label: 'Media tracking',
    description: 'Likes, watchlist, ratings, and notes.',
  },
  {
    value: 'watchHistory',
    label: 'Watch history',
    description: 'Watches and rewatches.',
  },
  {
    value: 'collections',
    label: 'Collections',
    description: 'Collections you own and their items.',
  },
  {
    value: 'recommendations',
    label: 'Recommendations',
    description: 'Settings and feedback.',
  },
  {
    value: 'friendships',
    label: 'Friends',
    description: 'Friends, requests, and blocks.',
  },
  {
    value: 'collectionRelationships',
    label: 'Collection access',
    description: 'Memberships and invitations.',
  },
  {
    value: 'notifications',
    label: 'Notifications',
  },
  {
    value: 'activity',
    label: 'Activity',
  },
];

const allCategories = exportOptions.map((option) => option.value);

const DataExportSection = ({ headingAs = 'h2' }: DataExportSectionProps) => {
  const [selected, setSelected] = useState<ExportCategory[]>(allCategories);
  const { mutate: exportUserData, isPending: isExporting } = useExportUserData();

  const toggleCategory = (category: ExportCategory, checked: boolean) => {
    setSelected((current) => (checked ? [...current, category] : current.filter((item) => item !== category)));
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading as={headingAs} textStyle="subsectionTitle">
          Export
        </Heading>
        <Text color="fg.muted" textStyle="supporting">
          Choose what to include.
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="4">
          <HStack gap="2">
            <Button size="sm" variant="outline" colorPalette="gray" onClick={() => setSelected(allCategories)}>
              Select all
            </Button>
            <Button size="sm" variant="ghost" colorPalette="gray" onClick={() => setSelected([])}>
              Clear all
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            {exportOptions.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <SimpleCheckbox
                  key={option.value}
                  checked={checked}
                  onCheckedChange={(details) => toggleCategory(option.value, details.checked === true)}
                  label={option.label}
                  description={option.description}
                />
              );
            })}
          </SimpleGrid>
          <Button
            alignSelf={{ base: 'stretch', md: 'flex-start' }}
            variant="outline"
            colorPalette="gray"
            onClick={() => exportUserData(selected)}
            loading={isExporting}
            disabled={isExporting || selected.length === 0}
          >
            <LuDownload />
            Export
          </Button>
          {selected.length === 0 ? (
            <Text color="fg.error" textStyle="supporting">
              Select at least one category.
            </Text>
          ) : null}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default DataExportSection;
