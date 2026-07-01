import { useState } from 'react';
import { Badge, Box, Flex, HStack, Icon, Image, Stack, Text } from '@chakra-ui/react';
import {
  LuActivity,
  LuBookmark,
  LuCheck,
  LuFolder,
  LuHeart,
  LuListPlus,
  LuLogIn,
  LuLogOut,
  LuSettings,
  LuUserPlus,
  LuX,
} from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import NavLink from '@/components/nav-link';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import CommonSpinner from '@/components/spinners/common-spinner';
import useActivity from '@/features/activity/api/use-activity';
import { ActivityMetadata, UserActivity, UserActivityType } from '@/features/activity/activity.types';
import { formatTimeAgo } from '@/utils/date';

interface ActivityCopy {
  label: string;
  detail: string;
  icon: React.ReactElement;
  colorPalette: string;
}

const activityCopyByType: Record<UserActivityType, ActivityCopy> = {
  [UserActivityType.AccountCreated]: {
    label: 'Account created',
    detail: 'Created this account',
    icon: <LuUserPlus />,
    colorPalette: 'green',
  },
  [UserActivityType.AccountLoggedIn]: {
    label: 'Signed in',
    detail: 'Logged in to this account',
    icon: <LuLogIn />,
    colorPalette: 'blue',
  },
  [UserActivityType.AccountLoggedOut]: {
    label: 'Signed out',
    detail: 'Logged out of this account',
    icon: <LuLogOut />,
    colorPalette: 'gray',
  },
  [UserActivityType.MediaLiked]: {
    label: 'Liked',
    detail: 'Added to liked media',
    icon: <LuHeart />,
    colorPalette: 'red',
  },
  [UserActivityType.MediaUnliked]: {
    label: 'Unliked',
    detail: 'Removed from liked media',
    icon: <LuX />,
    colorPalette: 'gray',
  },
  [UserActivityType.MediaWatched]: {
    label: 'Watched',
    detail: 'Marked as watched',
    icon: <LuCheck />,
    colorPalette: 'blue',
  },
  [UserActivityType.MediaUnwatched]: {
    label: 'Unwatched',
    detail: 'Removed from watched media',
    icon: <LuX />,
    colorPalette: 'gray',
  },
  [UserActivityType.MediaWatchlisted]: {
    label: 'Watchlisted',
    detail: 'Added to watchlist',
    icon: <LuBookmark />,
    colorPalette: 'green',
  },
  [UserActivityType.MediaRemovedFromWatchlist]: {
    label: 'Removed',
    detail: 'Removed from watchlist',
    icon: <LuX />,
    colorPalette: 'gray',
  },
  [UserActivityType.CollectionCreated]: {
    label: 'Collection created',
    detail: 'Created a collection',
    icon: <LuFolder />,
    colorPalette: 'purple',
  },
  [UserActivityType.CollectionUpdated]: {
    label: 'Collection updated',
    detail: 'Updated collection details',
    icon: <LuFolder />,
    colorPalette: 'purple',
  },
  [UserActivityType.CollectionDeleted]: {
    label: 'Collection deleted',
    detail: 'Deleted a collection',
    icon: <LuX />,
    colorPalette: 'gray',
  },
  [UserActivityType.CollectionItemAdded]: {
    label: 'Added to collection',
    detail: 'Added media to a collection',
    icon: <LuListPlus />,
    colorPalette: 'cyan',
  },
  [UserActivityType.CollectionItemRemoved]: {
    label: 'Removed from collection',
    detail: 'Removed media from a collection',
    icon: <LuX />,
    colorPalette: 'gray',
  },
  [UserActivityType.ProfileUpdated]: {
    label: 'Profile updated',
    detail: 'Updated account settings',
    icon: <LuSettings />,
    colorPalette: 'brand',
  },
};

const isActivityMetadata = (value: unknown): value is ActivityMetadata => {
  return typeof value === 'object' && value !== null;
};

const parseMetadata = (metadata: string | null): ActivityMetadata => {
  if (!metadata) return {};

  try {
    const parsed = JSON.parse(metadata) as unknown;
    return isActivityMetadata(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const getActivityCopy = (type: UserActivityType): ActivityCopy => {
  return activityCopyByType[type];
};

const getActivityTitle = (activity: UserActivity, metadata: ActivityMetadata) => {
  if (
    activity.type === UserActivityType.AccountCreated ||
    activity.type === UserActivityType.AccountLoggedIn ||
    activity.type === UserActivityType.AccountLoggedOut
  ) {
    return 'Account';
  }

  if (activity.type === UserActivityType.ProfileUpdated) {
    return 'Profile settings';
  }

  if (activity.type.startsWith('COLLECTION_') && !activity.media_id) {
    return metadata.collectionName ?? 'Collection';
  }

  return metadata.title ?? 'Media item';
};

const ActivitySubject = ({ activity, metadata }: { activity: UserActivity; metadata: ActivityMetadata }) => {
  const title = getActivityTitle(activity, metadata);

  if (activity.media_id && activity.media_type) {
    return (
      <NavLink to={`/app/media/${activity.media_type}/${activity.media_id}`} fontWeight="semibold" lineClamp={2}>
        {title}
      </NavLink>
    );
  }

  return (
    <Text fontWeight="semibold" lineClamp={2}>
      {title}
    </Text>
  );
};

const ActivityThumbnail = ({ activity, metadata }: { activity: UserActivity; metadata: ActivityMetadata }) => {
  if (metadata.poster_path) {
    return (
      <Image
        src={`https://image.tmdb.org/t/p/w185${metadata.poster_path}`}
        alt={`${metadata.title ?? 'Media'} poster`}
        w="14"
        h="20"
        objectFit="cover"
        borderRadius="md"
        flexShrink={0}
        onError={(event) => {
          event.currentTarget.src = '/assets/images/image-placeholder.svg';
        }}
      />
    );
  }

  const copy = getActivityCopy(activity.type);

  return (
    <Flex
      w="14"
      h="14"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      bg="bg.subtle"
      border="1px solid"
      borderColor="border.subtle"
      flexShrink={0}
    >
      <Icon color={`${copy.colorPalette}.fg`} fontSize="xl">
        {copy.icon}
      </Icon>
    </Flex>
  );
};

const ActivityItem = ({ activity }: { activity: UserActivity }) => {
  const metadata = parseMetadata(activity.metadata);
  const copy = getActivityCopy(activity.type);

  return (
    <Box as="article">
      <Flex
        gap="4"
        p="4"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="lg"
        alignItems={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
      >
        <ActivityThumbnail activity={activity} metadata={metadata} />

        <Box flex="1" minW="0">
          <HStack gap="2" mb="2" flexWrap="wrap">
            <Badge colorPalette={copy.colorPalette} variant="subtle">
              {copy.label}
            </Badge>
            <Text color="fg.muted" fontSize="sm">
              {formatTimeAgo(activity.createdAt)}
            </Text>
          </HStack>

          <ActivitySubject activity={activity} metadata={metadata} />

          <Text color="fg.muted" fontSize="sm" mt="1">
            {copy.detail}
            {metadata.collectionName && activity.media_id ? ` in ${metadata.collectionName}` : ''}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

const Activity = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useActivity(page);
  const activities = data?.data ?? [];

  return (
    <Box>
      <PageHeader
        isFetching={isFetching}
        subHeader="A private timeline of media, collection, and profile actions on your account."
      >
        Activity
      </PageHeader>

      {isLoading ? (
        <CommonSpinner />
      ) : isError ? (
        <ErrorState title="Error" description="Failed to fetch activity" onRetry={refetch} />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Actions you take in Kadha will appear here."
          icon={<LuActivity />}
        />
      ) : (
        <Stack gap="3">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}

          <PaginationControls pagination={data?.pagination} onPageChange={setPage} isDisabled={isFetching} />
        </Stack>
      )}
    </Box>
  );
};

export default Activity;
