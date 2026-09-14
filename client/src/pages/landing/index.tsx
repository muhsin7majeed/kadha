import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuGithub, LuServer, LuTv } from 'react-icons/lu';
import { Link } from 'react-router';

import BetaDisclosure from '@/components/beta-disclosure';
import Navbar from '@/components/navbar';
import { APP_CONFIG } from '@/config/app-config';
import CURRENT_FEATURES from './current-features';
import FAQ_ITEMS from './faq';
import ProductShowcase from './product-showcase';

const Landing = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <BetaDisclosure />

      <Box py={{ base: 16, md: 24 }} bg="bg.subtle" position="relative" overflow="hidden">
        <Container maxW="4xl" px={{ base: 4, md: 6 }} textAlign="center" position="relative" zIndex={1}>
          <Badge colorPalette="brand" size="lg" mb={4}>
            Private by default · Open source
          </Badge>
          <Heading as="h1" size={{ base: '3xl', md: '5xl' }} mb={6} lineHeight="tight">
            Keep track of what you watch.{' '}
            <Text as="span" color="brand.fg">
              Decide what comes next.
            </Text>
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg.muted" mb={8} maxW="2xl" mx="auto">
            Build your movie and TV history, keep shared lists with people you trust, and choose exactly what others can
            see.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button colorPalette="brand" size="lg" asChild>
              <Link to="/auth/register">Try the hosted beta</Link>
            </Button>
            <Button variant="outline" colorPalette="gray" size="lg" asChild>
              <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
                <LuGithub />
                View source and self-host
              </a>
            </Button>
          </HStack>
          <Text fontSize="sm" color="fg.muted" mt={4}>
            No email required. New accounts start private. Export or delete your data at any time.
          </Text>
        </Container>
      </Box>

      <ProductShowcase />

      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={12} textAlign="center">
            <Badge colorPalette="green">Available now</Badge>
            <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
              One place for your viewing life
            </Heading>
            <Text color="fg.muted" fontSize="lg" maxW="2xl">
              Search movies and TV through TMDB, explore current releases, and check streaming availability for your
              region.
            </Text>
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
                    <Heading as="h3" size="md">
                      {feature.title}
                    </Heading>
                    <Text color="fg.muted">{feature.description}</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="4xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} textAlign="center">
            <Badge colorPalette="gray">Product fit</Badge>
            <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
              Not a public review network
            </Heading>
            <Text color="fg.muted" fontSize="lg" maxW="3xl">
              Kadha is designed for personal tracking and deliberate sharing, not followers, public ratings, or
              building an audience. If you want a large film community and public reviews, Letterboxd is likely a
              better fit. If you want private movie and TV tracking with shared collections and a self-hosting option,
              Kadha may fit better.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="4xl" px={{ base: 4, md: 6 }}>
          <Card.Root variant="outline" borderColor="brand.muted" bg="brand.subtle">
            <Card.Body py={10}>
              <VStack gap={6} textAlign="center">
                <Box p={4} bg="brand.subtle" rounded="full">
                  <Icon fontSize="3xl" color="brand.fg">
                    <LuServer />
                  </Icon>
                </Box>
                <Heading as="h2" size={{ base: 'xl', md: '2xl' }}>
                  Prefer to run it yourself?
                </Heading>
                <Text fontSize="lg" color="fg.muted" maxW="xl">
                  Kadha is MIT-licensed and includes a Docker deployment path. Run your own instance and control its
                  database, backups, updates, and access policies.
                </Text>
                <Button variant="outline" colorPalette="brand" asChild>
                  <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
                    <LuGithub />
                    Self-host Kadha
                  </a>
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="4xl" px={{ base: 4, md: 6 }} textAlign="center">
          <VStack gap={4}>
            <Badge colorPalette="brand">Still evolving</Badge>
            <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
              See what is planned
            </Heading>
            <Text color="fg.muted" fontSize="lg" maxW="2xl">
              Kadha is still taking shape. Signed-in users can send feedback from the profile menu, or check the public
              roadmap to see what’s next.
            </Text>
            <Button variant="outline" colorPalette="gray" asChild>
              <a
                href={`${APP_CONFIG.githubUrl}/blob/master/ROADMAP.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View the roadmap
              </a>
            </Button>
          </VStack>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <VStack gap={4} mb={12} textAlign="center">
            <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
              Frequently asked questions
            </Heading>
            <Text fontSize="lg" color="fg.muted">
              Straight answers about the hosted beta, privacy, recovery, and self-hosting.
            </Text>
          </VStack>

          <Accordion.Root collapsible defaultValue={['item-0']}>
            {FAQ_ITEMS.map((item, index) => (
              <Accordion.Item key={item.question} value={`item-${index}`}>
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
          <Heading as="h2" size={{ base: '2xl', md: '3xl' }} mb={4}>
            Start your own watch history
          </Heading>
          <Text fontSize="lg" color="fg.muted" mb={8}>
            Create a private account, add a few titles, and see whether Kadha fits the way you watch.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button colorPalette="brand" size="lg" asChild>
              <Link to="/auth/register">Create beta account</Link>
            </Button>
            <Button variant="outline" colorPalette="gray" size="lg" asChild>
              <Link to="/auth/login">Sign in</Link>
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
              Personal by default. Shared when you choose.
            </Text>

            <HStack gap={4}>
              <ChakraLink asChild>
                <Link to="/privacy">
                  <Text fontSize="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                    Privacy
                  </Text>
                </Link>
              </ChakraLink>

              <ChakraLink asChild>
                <Link to="/terms">
                  <Text fontSize="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                    Terms
                  </Text>
                </Link>
              </ChakraLink>

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
