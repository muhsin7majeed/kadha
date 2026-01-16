import { EmptyState as ChakraEmptyState, VStack } from '@chakra-ui/react';
import { FaRegFolderOpen } from 'react-icons/fa';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmptyState = ({ title, description, icon = <FaRegFolderOpen /> }: EmptyStateProps) => {
  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content>
        <ChakraEmptyState.Indicator>{icon}</ChakraEmptyState.Indicator>

        <VStack textAlign="center">
          <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
          <ChakraEmptyState.Description>{description}</ChakraEmptyState.Description>
        </VStack>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
};

export default EmptyState;
