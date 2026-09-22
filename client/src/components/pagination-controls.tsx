import { HStack, IconButton, Text } from "@chakra-ui/react";
import type { RefObject } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import { PaginationMeta } from "@/types/common";

interface PaginationControlsProps {
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
  scrollTargetRef?: RefObject<HTMLElement | null>;
}

const PaginationControls = ({
  pagination,
  onPageChange,
  isDisabled,
  scrollTargetRef,
}: PaginationControlsProps) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasPreviousPage, hasNextPage } = pagination;
  const handlePageChange = (nextPage: number) => {
    scrollTargetRef?.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    onPageChange(nextPage);
  };

  return (
    <HStack justifyContent="center" gap="3" pt="6">
      <IconButton
        colorPalette="gray"
        aria-label="Previous page"
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage || isDisabled}
        onClick={() => handlePageChange(page - 1)}
      >
        <LuChevronLeft />
      </IconButton>
      <Text
        minW="24"
        textAlign="center"
        color="fg.muted"
        textStyle="supporting"
      >
        Page {page} of {totalPages}
      </Text>
      <IconButton
        colorPalette="gray"
        aria-label="Next page"
        variant="outline"
        size="sm"
        disabled={!hasNextPage || isDisabled}
        onClick={() => handlePageChange(page + 1)}
      >
        <LuChevronRight />
      </IconButton>
    </HStack>
  );
};

export default PaginationControls;
