import { Flex, FlexProps, Heading, Text } from '@chakra-ui/react';
import SyncSpinner from './spinners/sync-spinner';

interface PageHeaderProps extends FlexProps {
  action?: React.ReactNode;
  isFetching?: boolean;
  subHeader?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ action, isFetching, children, subHeader, ...props }) => {
  return (
    <Flex justifyContent="space-between" direction="column" gap={2} mb="4" {...props}>
      <Flex justify="space-between" align="start" gap="3">
        <Heading textStyle="pageTitle">
          {children} {isFetching && <SyncSpinner size="sm" />}
        </Heading>
        {action}
      </Flex>

      {subHeader && (
        <Text color="fg.muted" textStyle="supporting">
          {subHeader}
        </Text>
      )}
    </Flex>
  );
};

export default PageHeader;
