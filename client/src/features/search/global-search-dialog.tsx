import {
  Box,
  Card,
  CloseButton,
  Dialog,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Portal,
  SimpleGrid,
  Spinner,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCard from '@/components/media-card';
import PaginationControls from '@/components/pagination-controls';
import SimpleAvatar from '@/components/simple-avatar';
import { Tooltip } from '@/components/ui/tooltip';
import useSearchMedia from '@/features/media/api/use-search-media';
import useSearchUsers from '@/features/user/api/use-search-users';
import FriendshipActions from '@/pages/user/friendship/friendship-actions';
import NavLink from '@/components/nav-link';

type SearchTab = 'movie' | 'tv' | 'users';

const tabs: { value: SearchTab; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV' },
  { value: 'users', label: 'Users' },
];

const SearchLoadingState = () => (
  <VStack py={12} gap={3}>
    <Spinner color="orange" />
    <Text color="fg.muted" fontSize="sm">
      Searching
    </Text>
  </VStack>
);

interface MediaResultsProps {
  activeTab: SearchTab;
  query: string;
  page: number;
  open: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

const MediaResults = ({ activeTab, query, page, open, onClose, onPageChange }: MediaResultsProps) => {
  const mediaType = activeTab === 'tv' ? 'tv' : 'movie';
  const enabled = open && (activeTab === 'movie' || activeTab === 'tv') && query.length >= 2;
  const { data, isLoading, isFetching, error, refetch } = useSearchMedia(mediaType, query, page, enabled);

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <SearchLoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error"
        description={`Failed to fetch ${mediaType === 'movie' ? 'movies' : 'TV'}`}
        onRetry={refetch}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return <EmptyState title="No results found" description="Try a different search." icon={<LuSearch />} />;
  }

  return (
    <Box>
      <Text color="fg.muted" fontSize="sm" mb={4}>
        {data.pagination.total} results
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
        {data.data.map((media) => (
          <MediaCard key={`${media.media_type}:${media.media_id}`} media={media} onNavigate={onClose} />
        ))}
      </SimpleGrid>

      <PaginationControls pagination={data.pagination} isDisabled={isFetching} onPageChange={onPageChange} />
    </Box>
  );
};

interface UserResultsProps {
  activeTab: SearchTab;
  query: string;
  page: number;
  open: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

const UserResults = ({ activeTab, query, page, open, onClose, onPageChange }: UserResultsProps) => {
  const enabled = open && activeTab === 'users' && query.length >= 2;
  const { data, isLoading, isFetching, error, refetch } = useSearchUsers(query, page, enabled);
  const users = data?.data;

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <SearchLoadingState />;
  }

  if (error) {
    return <ErrorState title="Error" description="Failed to fetch users" onRetry={refetch} />;
  }

  if (!users || users.length === 0) {
    return <EmptyState title="No users found" description="Try a different search." icon={<LuSearch />} />;
  }

  return (
    <Box>
      <Text color="fg.muted" fontSize="sm" mb={4}>
        {data.pagination.total} results
      </Text>

      <VStack align="stretch" gap={3}>
        {users.map((user) => (
          <Card.Root key={user.id}>
            <Card.Body>
              <HStack justify="space-between" gap={4}>
                <NavLink
                  to={`/app/profile/${user.username}`}
                  display="flex"
                  alignItems="center"
                  gap={3}
                  onClick={onClose}
                >
                  <SimpleAvatar fallbackName={user.username} />
                  <Text fontWeight="medium">{user.username}</Text>
                </NavLink>

                <FriendshipActions
                  user={{
                    id: user.id,
                    friendshipStatus: user.friendshipStatus,
                    isRequestSender: user.isRequestSender,
                  }}
                />
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>

      <PaginationControls pagination={data.pagination} isDisabled={isFetching} onPageChange={onPageChange} />
    </Box>
  );
};

const GlobalSearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('movie');
  const [searchValue, setSearchValue] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchValue);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, trimmedQuery]);

  const handleTabChange = (details: { value: string }) => {
    if (tabs.some((tab) => tab.value === details.value)) {
      setActiveTab(details.value as SearchTab);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      initialFocusEl={() => inputRef.current}
      size="xl"
      scrollBehavior="inside"
    >
      <Tooltip content="Search">
        <Dialog.Trigger asChild>
          <IconButton aria-label="Search" variant="ghost" size="sm">
            <LuSearch />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH={{ base: '100dvh', md: '85vh' }} mx={{ base: 0, md: 4 }}>
            <Dialog.Header>
              <Dialog.Title>Search</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="stretch" gap={5}>
                <InputGroup
                  endElement={
                    searchValue ? (
                      <IconButton
                        aria-label="Clear search"
                        variant="plain"
                        size="sm"
                        onClick={() => setSearchValue('')}
                      >
                        <LuX />
                      </IconButton>
                    ) : (
                      <LuSearch />
                    )
                  }
                >
                  <Input
                    ref={inputRef}
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search"
                    borderRadius="lg"
                  />
                </InputGroup>

                <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
                  <Box overflowX="auto">
                    <Tabs.List minW="fit-content" whiteSpace="nowrap">
                      {tabs.map((tab) => (
                        <Tabs.Trigger key={tab.value} value={tab.value}>
                          {tab.label}
                        </Tabs.Trigger>
                      ))}
                    </Tabs.List>
                  </Box>

                  <Tabs.Content value="movie">
                    <MediaResults
                      activeTab={activeTab}
                      query={trimmedQuery}
                      page={page}
                      open={open}
                      onClose={handleClose}
                      onPageChange={setPage}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="tv">
                    <MediaResults
                      activeTab={activeTab}
                      query={trimmedQuery}
                      page={page}
                      open={open}
                      onClose={handleClose}
                      onPageChange={setPage}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="users">
                    <UserResults
                      activeTab={activeTab}
                      query={trimmedQuery}
                      page={page}
                      open={open}
                      onClose={handleClose}
                      onPageChange={setPage}
                    />
                  </Tabs.Content>
                </Tabs.Root>
              </VStack>
            </Dialog.Body>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default GlobalSearchDialog;
