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
              <Text>
                Hosted beta access is currently complimentary and requires no payment method. A useful free core and a
                paid tier for advanced or heavier-use features are planned if hosting costs require subscriptions.
                Users will receive advance notice before hosted pricing changes, and no one will be charged without
                explicitly choosing a paid subscription.
              </Text>
            </Section>

            <Section title="Your Account">
              <List.Root ps={5}>
                <List.Item>Use a password you do not reuse on other services.</List.Item>
                <List.Item>Keep your account recovery code private and store a copy outside Kadha.</List.Item>
                <List.Item>
                  Understand that your account cannot be recovered if you lose both your password and recovery code.
                </List.Item>
                <List.Item>Do not add highly sensitive personal information to the hosted beta.</List.Item>
                <List.Item>You are responsible for the content and collections you create or share.</List.Item>
              </List.Root>
            </Section>

            <Section title="Privacy And Sharing">
              <Text>
                New accounts start private, but you can choose to share profile sections or collections with friends or
                other signed-in users. People who receive shared data may copy or disclose it outside Kadha.
              </Text>
              <Text>
                The hosted service is not end-to-end encrypted. The application server and hosted operator can
                technically access stored account data as explained in the{' '}
                <ChakraLink asChild color="brand.fg">
                  <Link to="/privacy">Privacy Policy</Link>
                </ChakraLink>
                .
              </Text>
            </Section>

            <Section title="Acceptable Use">
              <Text>
                Do not use Kadha for spam, harassment, abusive usernames, attempts to disrupt the service, or content
                that violates applicable law. Accounts may be limited, suspended, or removed for abuse.
              </Text>
            </Section>

            <Section title="Self-Hosting">
              <Text>
                Kadha is open-source software licensed under the{' '}
                <ChakraLink asChild color="brand.fg">
                  <a
                    href={`${APP_CONFIG.githubUrl}/blob/master/LICENSE`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MIT License
                  </a>
                </ChakraLink>
                . The license permits use, copying, modification, distribution, sublicensing, and sale subject to its
                copyright and permission-notice requirements.
              </Text>
              <Text>
                If you operate an instance, you are responsible for configuration, security, backups, updates, privacy
                disclosures, and any users on that instance.
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
