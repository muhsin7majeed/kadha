import { IconButton, Input, InputGroup, InputGroupProps } from '@chakra-ui/react';
import { forwardRef, useEffect, useState } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';

interface SearchInputProps extends Partial<InputGroupProps> {
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  defaultValue?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearchChange, placeholder = 'Search', debounceMs = 300, defaultValue = '', ...props }, ref) => {
    const [searchQuery, setSearchQuery] = useState(defaultValue);

    useEffect(() => {
      const timer = setTimeout(() => {
        onSearchChange?.(searchQuery);
      }, debounceMs);

      return () => {
        clearTimeout(timer);
      };
    }, [searchQuery, debounceMs, onSearchChange]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
      setSearchQuery('');
    };

    return (
      <InputGroup
        endElement={
          searchQuery ? (
            <IconButton aria-label="Clear search" variant="plain" onClick={handleClearSearch}>
              <LuX />
            </IconButton>
          ) : (
            <LuSearch />
          )
        }
        {...props}
      >
        <Input ref={ref} borderRadius="lg" placeholder={placeholder} value={searchQuery} onChange={handleSearch} />
      </InputGroup>
    );
  },
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
