import { Badge, Box, Flex, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import type { Collection, ProfileCollectionSummary } from '@/features/collections/collections.types';
import {
  getCollectionAccessLabel,
  getCollectionSharingLabel,
} from '@/features/collections/utils/collection-sharing';
import { DataPrivacy } from '@/types/common';

type CollectionListEntry = Collection | ProfileCollectionSummary;

interface CollectionListProps {
  collections: CollectionListEntry[];
  getDetailsPath: (collection: CollectionListEntry) => string;
  renderActions?: (collection: CollectionListEntry) => ReactNode;
  showPeople?: boolean;
}

const privacyLabels: Record<DataPrivacy, string> = {
  [DataPrivacy.Public]: 'Public',
  [DataPrivacy.KadhaUsers]: 'Visible to Kadha users',
  [DataPrivacy.Friends]: 'Visible to friends',
  [DataPrivacy.OnlyMe]: 'Only you',
};

const isAuthenticatedCollection = (collection: CollectionListEntry): collection is Collection =>
  'userId' in collection;

const getPeoplePreview = (collection: Collection) => {
  const names = [collection.owner?.username, ...(collection.members ?? []).map((member) => member.user.username)].filter(
    (name): name is string => Boolean(name),
  );
  const visibleNames = names.slice(0, 3);
  const totalPeople = collection.memberCount ?? names.length;
  const hiddenCount = Math.max(totalPeople - visibleNames.length, 0);

  if (visibleNames.length === 0) return null;

  return `${visibleNames.join(', ')}${hiddenCount > 0 ? ` +${hiddenCount}` : ''}`;
};

const CollectionList = ({ collections, getDetailsPath, renderActions, showPeople = false }: CollectionListProps) => (
  <Stack as="ul" aria-label="Collections" gap="3" listStyleType="none">
    {collections.map((collection) => {
      const authenticatedCollection = isAuthenticatedCollection(collection) ? collection : null;
      const sharingLabel = authenticatedCollection ? getCollectionSharingLabel(authenticatedCollection) : null;
      const accessLabel = authenticatedCollection ? getCollectionAccessLabel(authenticatedCollection) : null;
      const peoplePreview = authenticatedCollection && showPeople ? getPeoplePreview(authenticatedCollection) : null;

      return (
        <Flex
          as="li"
          key={collection.id}
          align="stretch"
          border="1px solid"
          borderColor="border.muted"
          borderRadius="lg"
          bg="bg.panel"
          overflow="hidden"
          transition="border-color 0.15s ease, background 0.15s ease"
          _hover={{ borderColor: 'border.emphasized', bg: 'bg.subtle' }}
          _focusWithin={{ borderColor: 'border.emphasized' }}
        >
          <ChakraLink asChild flex="1" minW="0" color="inherit" textDecoration="none" _hover={{ textDecoration: 'none' }}>
            <Link to={getDetailsPath(collection)}>
              <Stack gap="2" width="full" minW="0" px={{ base: 4, md: 5 }} py="4">
                <Box minW="0">
                  <Text fontWeight="semibold" textStyle="cardTitle" lineClamp={1}>
                    {collection.name}
                  </Text>
                  {collection.description && (
                    <Text color="fg.muted" textStyle="supporting" lineClamp={2} mt="1">
                      {collection.description}
                    </Text>
                  )}
                </Box>

                <HStack gap="2" flexWrap="wrap">
                  <Badge variant="surface" colorPalette="gray">
                    {collection.itemCount ?? 0} {(collection.itemCount ?? 0) === 1 ? 'item' : 'items'}
                  </Badge>
                  <Badge variant="subtle" colorPalette="gray">
                    {privacyLabels[collection.privacy]}
                  </Badge>
                  {sharingLabel && (
                    <Text color="fg.muted" textStyle="supporting">
                      {sharingLabel}
                    </Text>
                  )}
                  {accessLabel && (
                    <Badge variant="surface" colorPalette="brand">
                      {accessLabel}
                    </Badge>
                  )}
                </HStack>

                {peoplePreview && (
                  <Text color="fg.muted" textStyle="supporting" lineClamp={1}>
                    {peoplePreview}
                  </Text>
                )}
              </Stack>
            </Link>
          </ChakraLink>

          {renderActions && (
            <Flex align="flex-start" flexShrink={0} p="2">
              {renderActions(collection)}
            </Flex>
          )}
        </Flex>
      );
    })}
  </Stack>
);

export default CollectionList;
export type { CollectionListEntry };
