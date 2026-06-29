import { Box, Tabs } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import MediaSearchResults from '@/features/search/components/media-search-results';
import UserSearchResults from '@/features/search/components/user-search-results';
import { SearchTab, SearchTabOption } from '@/features/search/search.types';

interface SearchTabsProps {
  activeTab: SearchTab;
  hasSearchQuery: boolean;
  query: string;
  page: number;
  open: boolean;
  tabs: SearchTabOption[];
  controls: ReactNode;
  startState: ReactNode;
  onClose: () => void;
  onPageChange: (page: number) => void;
  onTabChange: (tab: SearchTab) => void;
}

const SearchTabs = ({
  activeTab,
  hasSearchQuery,
  query,
  page,
  open,
  tabs,
  controls,
  startState,
  onClose,
  onPageChange,
  onTabChange,
}: SearchTabsProps) => {
  const handleTabChange = (details: { value: string }) => {
    if (tabs.some((tab) => tab.value === details.value)) {
      onTabChange(details.value as SearchTab);
    }
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      <Box position="sticky" top={0} zIndex="sticky" bg="bg" borderBottomWidth="1px" borderColor="border" pb={3}>
        {controls}

        {hasSearchQuery && (
          <Box overflowX="auto" mt={4}>
            <Tabs.List minW="fit-content" whiteSpace="nowrap">
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value}>
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Box>
        )}
      </Box>

      {hasSearchQuery ? (
        <>
          <Tabs.Content value="movie">
            <MediaSearchResults
              activeTab={activeTab}
              query={query}
              page={page}
              open={open}
              onClose={onClose}
              onPageChange={onPageChange}
            />
          </Tabs.Content>
          <Tabs.Content value="tv">
            <MediaSearchResults
              activeTab={activeTab}
              query={query}
              page={page}
              open={open}
              onClose={onClose}
              onPageChange={onPageChange}
            />
          </Tabs.Content>
          <Tabs.Content value="users">
            <UserSearchResults
              activeTab={activeTab}
              query={query}
              page={page}
              open={open}
              onClose={onClose}
              onPageChange={onPageChange}
            />
          </Tabs.Content>
        </>
      ) : (
        <Box pt={5}>{startState}</Box>
      )}
    </Tabs.Root>
  );
};

export default SearchTabs;
