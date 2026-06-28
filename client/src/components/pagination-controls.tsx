import { HStack, IconButton, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import { PaginationMeta } from '@/types/common';

interface PaginationControlsProps {
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
}

const PaginationControls = ({ pagination, onPageChange, isDisabled }: PaginationControlsProps) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasPreviousPage, hasNextPage } = pagination;

  return (
    <HStack justifyContent="center" gap="3" pt="6">
      <IconButton
        aria-label="Previous page"
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage || isDisabled}
        onClick={() => onPageChange(page - 1)}
      >
        <LuChevronLeft />
      </IconButton>
      <Text minW="24" textAlign="center" color="fg.muted" fontSize="sm">
        Page {page} of {totalPages}
      </Text>
      <IconButton
        aria-label="Next page"
        variant="outline"
        size="sm"
        disabled={!hasNextPage || isDisabled}
        onClick={() => onPageChange(page + 1)}
      >
        <LuChevronRight />
      </IconButton>
    </HStack>
  );
};

export default PaginationControls;
