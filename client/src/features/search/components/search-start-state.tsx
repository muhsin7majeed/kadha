import { LuSearch } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';

const SearchStartState = () => (
  <EmptyState
    title="Start searching"
    description="Enter at least 2 characters to search movies, TV, or users."
    icon={<LuSearch />}
  />
);

export default SearchStartState;
