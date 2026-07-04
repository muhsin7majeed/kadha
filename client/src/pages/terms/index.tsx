import { Box, Container, Heading, Link as ChakraLink, List, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router';

import BetaDisclosure from '@/components/beta-disclosure';
import Navbar from '@/components/navbar';
import { APP_CONFIG } from '@/config/app-config';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box as="section">
    <Heading size="lg" mb={3}>
      {title}
    </Heading>
    <VStack align="start" gap={3} color="fg.muted">
      {children}
    </VStack>
  </Box>
);

const Terms = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <BetaDisclosure />

      <Box py={{ base: 12, md: 16 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <VStack align="start" gap={8}>
            <Box>
              <Heading size={{ base: '2xl', md: '3xl' }} mb={4}>
                Terms
              </Heading>
              <Text color="fg.muted">
                These terms apply to the hosted {APP_CONFIG.appName} beta. Self-hosted users are responsible for their
                own deployments.
              </Text>
            </Box>

            <Section title="Early Beta">
              <Text>
                Kadha is provided as an early beta. Features may change, hosted data may be reset, and the service may
                be paused or discontinued while the product is being tested.
              </Text>
            </Section>

            <Section title="Your Account">
              <List.Root ps={5}>
                <List.Item>Use a password you do not reuse on other services.</List.Item>
                <List.Item>Do not add highly sensitive personal information to the hosted beta.</List.Item>
                <List.Item>You are responsible for the content and collections you create or share.</List.Item>
              </List.Root>
            </Section>

            <Section title="Acceptable Use">
              <Text>
                Do not use Kadha for spam, harassment, abusive usernames, attempts to disrupt the service, or content
                that violates applicable law. Accounts may be limited, suspended, or removed for abuse.
              </Text>
            </Section>

            <Section title="Self-Hosting">
              <Text>
                Kadha is open source and self-hostable. If you run your own instance, you are responsible for
                configuration, security, backups, updates, and any users on that instance.
              </Text>
            </Section>

            <Section title="TMDB">
              <Text>
                Movie and TV metadata is powered by TMDB. This product uses the TMDB API but is not endorsed or
                certified by TMDB.
              </Text>
            </Section>

            <Section title="No Warranty">
              <Text>
                Kadha is provided as-is during beta, without guarantees about uptime, data preservation, correctness of
                media metadata, or fitness for a particular purpose.
              </Text>
            </Section>

            <Section title="Feedback">
              <Text>
                Feedback is welcome through{' '}
                <ChakraLink asChild color="brand.fg">
                  <a href={`${APP_CONFIG.githubUrl}/issues`} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </ChakraLink>
                .
              </Text>
              <ChakraLink asChild color="brand.fg">
                <Link to="/">Back to home</Link>
              </ChakraLink>
            </Section>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Terms;
