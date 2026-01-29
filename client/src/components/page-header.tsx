import { Flex, FlexProps, Heading, Text } from '@chakra-ui/react';
import SyncSpinner from './spinners/sync-spinner';

interface PageHeaderProps extends FlexProps {
  isFetching?: boolean;
  subHeader?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ isFetching, children, subHeader, ...props }) => {
  return (
    <Flex justifyContent="space-between" direction="column" gap={2} mb="4" {...props}>
      <Heading>
        {children} {isFetching && <SyncSpinner size="sm" />}
      </Heading>

      {subHeader && (
        <Text color="fg.muted" textStyle="sm">
          {subHeader}
        </Text>
      )}
    </Flex>
  );
};

export default PageHeader;
