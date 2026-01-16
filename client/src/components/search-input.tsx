import { IconButton, Input, InputGroup, InputGroupProps } from '@chakra-ui/react';
import { LuSearch, LuX } from 'react-icons/lu';
import { useEffect, useState } from 'react';

interface SearchInputProps extends Partial<InputGroupProps> {
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  defaultValue?: string;
}
const SearchInput = ({
  onSearchChange,
  placeholder = 'Search',
  debounceMs = 300,
  defaultValue = '',

  ...props
}: SearchInputProps) => {
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
          <IconButton variant="plain" onClick={handleClearSearch}>
            <LuX />
          </IconButton>
        ) : (
          <LuSearch />
        )
      }
      {...props}
    >
      <Input placeholder={placeholder} value={searchQuery} onChange={handleSearch} />
    </InputGroup>
  );
};

export default SearchInput;
