import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router';
import { LuHouse, LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled client error', error, errorInfo);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback onReset={() => this.setState({ error: null })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onReset }: { onReset: () => void }) => {
  return (
    <Box minH="100vh" bg="bg.subtle" display="flex" alignItems="center">
      <Container maxW="lg">
        <VStack gap={6} textAlign="center">
          <Box p={4} rounded="full" bg="red.subtle" color="red.fg">
            <Icon fontSize="4xl">
              <LuTriangleAlert />
            </Icon>
          </Box>

          <VStack gap={3}>
            <Heading size={{ base: 'xl', md: '2xl' }}>Something went wrong</Heading>
            <Text color="fg.muted" fontSize="md">
              Kadha hit an unexpected client error. Try reloading the page or return home.
            </Text>
          </VStack>

          <HStack gap={3} flexWrap="wrap" justify="center">
            <Button colorPalette="brand" onClick={() => window.location.reload()}>
              <LuRefreshCw />
              Reload
            </Button>
            <Button variant="outline" asChild onClick={onReset}>
              <Link to="/">
                <LuHouse />
                Home
              </Link>
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return <ErrorBoundary resetKey={location.key}>{children}</ErrorBoundary>;
};

export default AppErrorBoundary;
