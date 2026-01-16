import { Button, EmptyState, VStack } from '@chakra-ui/react';
import { BiSolidError } from 'react-icons/bi';

interface ErrorStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
}

const ErrorState = ({ title, description, icon = <BiSolidError />, onRetry }: ErrorStateProps) => {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>{icon}</EmptyState.Indicator>

        <VStack textAlign="center">
          <EmptyState.Title>{title}</EmptyState.Title>
          <EmptyState.Description>{description}</EmptyState.Description>

          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  );
};

export default ErrorState;
