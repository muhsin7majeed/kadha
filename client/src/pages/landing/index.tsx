import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Card,
  Accordion,
  Link as ChakraLink,
  Badge,
  Flex,
  Table,
} from '@chakra-ui/react';
import { LuGithub, LuTv, LuGlobe, LuLock, LuServer, LuUsers, LuMessagesSquare, LuListChecks } from 'react-icons/lu';
import { Link } from 'react-router';
import Navbar from '@/components/navbar';
import { APP_CONFIG } from '@/config/app-config';
import FAQ_ITEMS from './faq';
import CURRENT_FEATURES from './current-features';
import UPCOMING_FEATURES from './upcoming-features';

const AUDIENCES = [
  {
    icon: LuUsers,
    title: 'Couples and families',
    description: 'Build a shared watchlist without losing movie-night ideas in chat.',
  },
  {
    icon: LuMessagesSquare,
    title: 'Friend groups',
    description: 'Create collaborative collections for watch parties, recommendations, and inside-joke lists.',
  },
  {
    icon: LuServer,
    title: 'Self-hosters',
    description: 'Run your own instance and keep your movie and TV history on infrastructure you control.',
  },
  {
    icon: LuLock,
    title: 'Privacy-conscious users',
    description: 'Choose who can see your profile, watched list, liked list, watchlist, and collections.',
  },
];

const COMPARISON_ROWS = [
  {
    label: 'Best for',
    kadha: 'Private tracking and shared lists',
    letterboxd: 'Film culture and reviews',
    trakt: 'Automated media tracking',
  },
  {
    label: 'Shared planning',
    kadha: 'Collaborative collections',
    letterboxd: 'Lists and sharing',
    trakt: 'Lists',
  },
  {
    label: 'Self-hosting',
    kadha: 'Yes',
    letterboxd: 'No',
    trakt: 'No',
  },
  {
    label: 'Data ownership',
    kadha: 'Primary focus',
    letterboxd: 'Hosted platform',
    trakt: 'Hosted platform',
  },
];

const Landing = () => {
  return (
    <Box minH="100vh">
      <Navbar />

      <Box py={{ base: 16, md: 24 }} bg="bg.subtle" position="relative" overflow="hidden">
        <Container maxW="4xl" px={{ base: 4, md: 6 }} textAlign="center" position="relative" zIndex={1}>
          <Badge colorPalette="brand" size="lg" mb={4}>
            Open Source & Self-Hostable
          </Badge>
          <Heading size={{ base: '3xl', md: '5xl' }} mb={6} lineHeight="tight">
            Your private home for{' '}
            <Text as="span" color="brand.fg">
              movies and TV.
            </Text>
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg.muted" mb={8} maxW="2xl" mx="auto">
            Track what you've watched, save what you want to watch next, and build shared collections with people you
            trust. Use Kadha online or run it on your own server.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button colorPalette="brand" size="lg" asChild>
              <Link to="/auth/register">Start Tracking</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
                <LuGithub />
                View on GitHub
              </a>
            </Button>
          </HStack>
          <Text fontSize="sm" color="fg.muted" mt={4}>
            No credit card required. Open source, self-hostable, and powered by TMDB.
          </Text>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: 8, lg: 10 }} alignItems="start">
            <VStack align="start" gap={4}>
              <Badge colorPalette="gray">Why Kadha exists</Badge>
              <Heading size={{ base: '2xl', md: '3xl' }}>A quieter way to track what you watch</Heading>
              <Text color="fg.muted" fontSize="lg">
                Most watch trackers are built around public profiles, reviews, ads, or platform lock-in. Kadha is built
                for people who want a private place to organize movies and TV with the people they actually watch with.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} gridColumn={{ base: 'auto', lg: 'span 2' }}>
              {[
                'Your watch history should not have to be public.',
                'Your shared watchlist should not live in a group chat.',
                "Your data should not be trapped in someone else's platform.",
              ].map((item) => (
                <HStack key={item} align="start" gap={3} p={4} borderWidth="1px" borderColor="border" rounded="md">
                  <Icon color="brand.fg" mt={1}>
                    <LuListChecks />
                  </Icon>
                  <Text color="fg.muted">{item}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={12} textAlign="center">
            <Badge colorPalette="brand">Built For</Badge>
            <Heading size={{ base: '2xl', md: '3xl' }}>People who watch together</Heading>
            <Text color="fg.muted" fontSize="lg" maxW="2xl">
              Kadha is strongest when tracking is personal, private, and shared with a small group.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
            {AUDIENCES.map((audience) => (
              <VStack
                key={audience.title}
                align="start"
                gap={3}
                p={5}
                borderWidth="1px"
                borderColor="border"
                rounded="md"
                bg="bg"
              >
                <Box p={3} bg="brand.subtle" rounded="md">
                  <Icon fontSize="xl" color="brand.fg">
                    <audience.icon />
                  </Icon>
                </Box>
                <Heading size="md">{audience.title}</Heading>
                <Text color="fg.muted">{audience.description}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={10} textAlign="center">
            <Badge colorPalette="gray">Comparison</Badge>
            <Heading size={{ base: '2xl', md: '3xl' }}>Not trying to be next Letterboxd</Heading>
            <Text color="fg.muted" fontSize="lg" maxW="3xl">
              Letterboxd is excellent for public film culture. Trakt and Simkl are strong hosted trackers. Kadha is for
              private movie and TV tracking, shared planning, and self-hosting.
            </Text>
          </VStack>

          <Box overflowX="auto" borderWidth="1px" borderColor="border" rounded="md">
            <Table.Root minW="760px" size="sm">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader>Feature</Table.ColumnHeader>
                  <Table.ColumnHeader>Kadha</Table.ColumnHeader>
                  <Table.ColumnHeader>Letterboxd</Table.ColumnHeader>
                  <Table.ColumnHeader>Trakt / Simkl</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {COMPARISON_ROWS.map((row) => (
                  <Table.Row key={row.label}>
                    <Table.Cell fontWeight="medium">{row.label}</Table.Cell>
                    <Table.Cell color="brand.fg" fontWeight="medium">
                      {row.kadha}
                    </Table.Cell>
                    <Table.Cell>{row.letterboxd}</Table.Cell>
                    <Table.Cell>{row.trakt}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Text color="fg.muted" mt={5} textAlign="center">
            Use Letterboxd if you want public reviews, ratings, and film-community discovery. Use Kadha if you want a
            private, self-hostable tracker for movies, TV, and shared watch planning.
          </Text>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={12} textAlign="center">
            <Badge colorPalette="green">Available Now</Badge>
            <Heading size={{ base: '2xl', md: '3xl' }}>What you can do today</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {CURRENT_FEATURES.map((feature) => (
              <Card.Root key={feature.title} variant="outline">
                <Card.Body>
                  <VStack align="start" gap={3}>
                    <Box p={3} bg="brand.subtle" rounded="lg">
                      <Icon fontSize="xl" color="brand.fg">
                        <feature.icon />
                      </Icon>
                    </Box>
                    <HStack flexWrap="wrap">
                      <Heading size="md">{feature.title}</Heading>
                      {'badge' in feature && feature.badge && (
                        <Badge size="sm" colorPalette="gray">
                          {feature.badge}
                        </Badge>
                      )}
                    </HStack>
                    <Text color="fg.muted">{feature.description}</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={12} textAlign="center">
            <Badge colorPalette="brand">Coming Soon</Badge>
            <Heading size={{ base: '2xl', md: '3xl' }}>What we're building</Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {UPCOMING_FEATURES.map((feature) => (
              <Card.Root key={feature.title} variant="outline">
                <Card.Body>
                  <HStack align="start" gap={4}>
                    <Box p={3} bg="brand.subtle" rounded="lg" flexShrink={0}>
                      <Icon fontSize="xl" color="brand.solid">
                        <feature.icon />
                      </Icon>
                    </Box>
                    <VStack align="start" gap={2}>
                      <HStack flexWrap="wrap">
                        <Heading size="md">{feature.title}</Heading>
                        <Badge size="sm" colorPalette="gray">
                          {feature.badge}
                        </Badge>
                      </HStack>
                      <Text color="fg.muted">{feature.description}</Text>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="4xl" px={{ base: 4, md: 6 }}>
          <Card.Root variant="outline" borderColor="brand.muted" bg="brand.subtle">
            <Card.Body py={10}>
              <VStack gap={6} textAlign="center">
                <Box p={4} bg="brand.subtle" rounded="full">
                  <Icon fontSize="3xl" color="brand.fg">
                    <LuGlobe />
                  </Icon>
                </Box>
                <Heading size={{ base: 'xl', md: '2xl' }}>Your Server, Your Cinema</Heading>
                <Text fontSize="lg" color="fg.muted" maxW="xl">
                  Don't want your watch history on someone else's server? Fork the repo, deploy with Docker, and run
                  your own instance. Modify it however you want.
                </Text>
                <Button variant="outline" colorPalette="brand" asChild>
                  <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
                    <LuGithub />
                    Check out the repo
                  </a>
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={12} textAlign="center">
            <Heading size={{ base: '2xl', md: '3xl' }}>Frequently Asked Questions</Heading>
            <Text fontSize="lg" color="fg.muted">
              Straight answers for people comparing Kadha with hosted watch trackers.
            </Text>
          </VStack>

          <Accordion.Root collapsible defaultValue={['item-0']}>
            {FAQ_ITEMS.map((item, index) => (
              <Accordion.Item key={index} value={`item-${index}`}>
                <Accordion.ItemTrigger>
                  <Text fontWeight="medium">{item.question}</Text>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody>
                    <Text color="fg.muted">{item.answer}</Text>
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="4xl" px={{ base: 4, md: 6 }} textAlign="center">
          <Heading size={{ base: '2xl', md: '3xl' }} mb={4}>
            Start your private watch hub
          </Heading>
          <Text fontSize="lg" color="fg.muted" mb={8}>
            Keep your movies, shows, lists, and shared plans in one place without turning your taste into public
            content.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button colorPalette="brand" size="lg" asChild>
              <Link to="/auth/register">Create Free Account</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth/login">Login</Link>
            </Button>
          </HStack>
        </Container>
      </Box>

      <Box borderTopWidth="1px" borderColor="border" py={8}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
            <HStack gap={2}>
              <Icon fontSize="xl" color="brand.fg">
                <LuTv />
              </Icon>
              <Text fontWeight="semibold">{APP_CONFIG.appName}</Text>
            </HStack>

            <Text color="fg.muted" fontSize="sm">
              Open source. Privacy-first. Built for private movie and TV tracking.
            </Text>

            <HStack gap={4}>
              <ChakraLink asChild>
                <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
                  <HStack gap={1} color="fg.muted" _hover={{ color: 'fg' }}>
                    <LuGithub />
                    <Text fontSize="sm">GitHub</Text>
                  </HStack>
                </a>
              </ChakraLink>
            </HStack>
          </Flex>

          <Flex justify="center" mt={6} pt={6} borderTopWidth="1px" borderColor="border">
            <Text fontSize="xs" color="fg.muted">
              Movie and TV data powered by{' '}
              <ChakraLink
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                color="fg.muted"
                textDecoration="underline"
                _hover={{ color: 'fg' }}
              >
                TMDB
              </ChakraLink>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
