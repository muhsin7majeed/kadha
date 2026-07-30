import { Box, Container, Heading, Link as ChakraLink, List, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router';

import BetaDisclosure from '@/components/beta-disclosure';
import Navbar from '@/components/navbar';
import { APP_CONFIG } from '@/config/app-config';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box as="section">
    <Heading textStyle="sectionTitle" mb={3}>
      {title}
    </Heading>
    <VStack align="start" gap={3} color="fg.muted">
      {children}
    </VStack>
  </Box>
);

const Privacy = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <BetaDisclosure />

      <Box py={{ base: 12, md: 16 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <VStack align="start" gap={8}>
            <Box>
              <Heading size={{ base: '2xl', md: '3xl' }} mb={4}>
                Privacy Policy
              </Heading>
              <Text color="fg.muted">
                This policy explains how {APP_CONFIG.appName} handles data for the hosted beta and for self-hosted
                deployments.
              </Text>
            </Box>

            <Section title="Hosted Beta">
              <Text>
                The hosted Kadha beta is for early testing. Data may be reset while the product changes. Do not add
                information you would consider highly sensitive.
              </Text>
              <Text>
                The hosted beta is not end-to-end encrypted. Passwords are hashed, but account data and media activity
                are stored in the application database in a form the instance operator can access.
              </Text>
            </Section>

            <Section title="Data Kadha Stores">
              <Text>Kadha may store the following data when you use the hosted beta:</Text>
              <List.Root ps={5}>
                <List.Item>
                  Username, password hash, account role, watch region, and account recovery-code verifier.
                </List.Item>
                <List.Item>Watched, liked, and watchlist items.</List.Item>
                <List.Item>Collections, collection items, collection sharing, and invitations.</List.Item>
                <List.Item>Friendships, blocks, notifications, and account activity records.</List.Item>
                <List.Item>Movie and TV metadata copied from TMDB for saved items.</List.Item>
              </List.Root>
            </Section>

            <Section title="Data Kadha Does Not Currently Collect">
              <List.Root ps={5}>
                <List.Item>Email addresses.</List.Item>
                <List.Item>Phone numbers.</List.Item>
                <List.Item>Payment information.</List.Item>
                <List.Item>Advertising identifiers.</List.Item>
                <List.Item>Analytics events, unless this changes and is disclosed later.</List.Item>
              </List.Root>
            </Section>

            <Section title="Self-Hosted Instances">
              <Text>
                If you self-host Kadha, you control your own deployment, database, logs, backups, secrets, and access
                policies. This hosted beta policy does not control third-party or personal self-hosted instances.
              </Text>
            </Section>

            <Section title="Third-Party Data">
              <Text>
                Kadha uses TMDB for movie and TV metadata. This product uses the TMDB API but is not endorsed or
                certified by TMDB.
              </Text>
            </Section>

            <Section title="Account Recovery">
              <Text>
                Kadha issues a private recovery code without requiring an email address or phone number. The plaintext
                code is shown when it is created, while Kadha stores only a one-way verifier and its issue date.
              </Text>
              <Text>
                Anyone with your username and recovery code can reset your password. Keep the code private and outside
                Kadha. If you lose both your password and recovery code, the account cannot be recovered through the
                product or support.
              </Text>
            </Section>

            <Section title="Data Export And Deletion">
              <Text>
                You can download a JSON export of your account data from Settings. Self-service account deletion is not
                yet available; request deletion through the project feedback channel.
              </Text>
            </Section>

            <Section title="Contact And Feedback">
              <Text>
                For questions, feedback, or account deletion requests during beta, open an issue on{' '}
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

export default Privacy;
