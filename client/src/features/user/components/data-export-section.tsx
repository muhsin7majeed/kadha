import { Box, Button, Card, Checkbox, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuDownload } from 'react-icons/lu';

import useExportUserData from '@/features/user/api/use-export-user-data';
import type { ExportCategory } from '@/features/user/user-import.types';

interface DataExportSectionProps {
  headingAs?: 'h2' | 'h3';
}

const exportOptions: Array<{
  value: ExportCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'accountPreferences',
    label: 'Account profile and preferences',
    description: 'Username, privacy settings, and watch region.',
  },
  {
    value: 'mediaTracking',
    label: 'Media tracking',
    description: 'Liked, watched, watchlist, ratings, dates, and personal notes.',
  },
  {
    value: 'watchHistory',
    label: 'Watch history',
    description: 'Movie watches, rewatches, and TV episode watches.',
  },
  {
    value: 'collections',
    label: 'Owned collections',
    description: 'Collections you own and their items.',
  },
  {
    value: 'recommendations',
    label: 'Recommendations',
    description: 'Recommendation settings and feedback.',
  },
  {
    value: 'friendships',
    label: 'Friendships',
    description: 'Friend requests, friends, and blocked relationships.',
  },
  {
    value: 'collectionRelationships',
    label: 'Collection relationships',
    description: 'Memberships and invitations involving your account.',
  },
  {
    value: 'notifications',
    label: 'Notifications',
    description: 'Your notification history.',
  },
  {
    value: 'activity',
    label: 'Activity',
    description: 'Your account activity history.',
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
          Choose what to include in your JSON data export. Passwords, recovery codes, sessions, roles, and account IDs
          are never included.
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
                    <Checkbox.Label fontWeight="medium">{option.label}</Checkbox.Label>
                    <Text color="fg.muted" textStyle="supporting" mt="1">
                      {option.description}
                    </Text>
                  </Box>
                </Checkbox.Root>
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
            Export selected data
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
