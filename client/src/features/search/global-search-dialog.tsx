import { IconButton } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuSearch } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import SearchInput from '@/components/search-input';
import { Tooltip } from '@/components/ui/tooltip';
import SearchStartState from '@/features/search/components/search-start-state';
import SearchTabs from '@/features/search/components/search-tabs';
import { SearchTab, SearchTabOption } from '@/features/search/search.types';

const MIN_SEARCH_LENGTH = 2;

const tabs: SearchTabOption[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV' },
  { value: 'users', label: 'Users' },
];

const GlobalSearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('movie');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const hasSearchQuery = trimmedQuery.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    setPage(1);
  }, [activeTab, trimmedQuery]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SimpleDialog
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      initialFocusEl={() => inputRef.current}
      size="cover"
      scrollBehavior="inside"
      title="Search"
      closeButton
      contentProps={{ maxH: { base: '100dvh', md: '85vh' }, mx: { base: 0, md: 4 }, py: 0 }}
      triggerWrapper={(trigger) => <Tooltip content="Search">{trigger}</Tooltip>}
      trigger={
        <IconButton aria-label="Search" variant="ghost" size="sm">
          <LuSearch />
        </IconButton>
      }
    >
      <SearchTabs
        activeTab={activeTab}
        hasSearchQuery={hasSearchQuery}
        query={trimmedQuery}
        page={page}
        open={open}
        tabs={tabs}
        controls={<SearchInput ref={inputRef} onSearchChange={setQuery} />}
        startState={<SearchStartState />}
        onClose={handleClose}
        onPageChange={setPage}
        onTabChange={setActiveTab}
      />
    </SimpleDialog>
  );
};

export default GlobalSearchDialog;
