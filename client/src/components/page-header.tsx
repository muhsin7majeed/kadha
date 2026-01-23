import { Flex, FlexProps, Heading } from '@chakra-ui/react';
import SyncSpinner from './spinners/sync-spinner';

interface PageHeaderProps extends FlexProps {
  isFetching?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ isFetching, children, ...props }) => {
  return (
    <Flex justifyContent="space-between" alignItems="center" {...props}>
      <Heading>{children}</Heading>

      {isFetching && <SyncSpinner />}
    </Flex>
  );
};

export default PageHeader;
