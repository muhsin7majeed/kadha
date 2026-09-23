import { Flex, FlexProps, Heading, Text } from '@chakra-ui/react';
import LoadingStatus from './loading/loading-status';

interface PageHeaderProps extends FlexProps {
  action?: React.ReactNode;
  isRefreshing?: boolean;
  subHeader?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ action, isRefreshing, children, subHeader, ...props }) => {
  return (
    <Flex justifyContent="space-between" direction="column" gap={2} mb="4" {...props}>
      <Flex justify="space-between" align="start" gap="3">
        <Flex align="center" gap="2">
          <Heading textStyle="pageTitle">{children}</Heading>
          {isRefreshing && <LoadingStatus />}
        </Flex>
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
