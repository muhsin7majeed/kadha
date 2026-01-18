import { useColorMode } from '@/components/ui/color-mode';
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
  IconButton,
  Card,
  Accordion,
  Link as ChakraLink,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { LuMoon, LuSun, LuGithub, LuTv, LuGlobe } from 'react-icons/lu';
import { Link } from 'react-router';
import FAQ_ITEMS from './faq';
import CURRENT_FEATURES from './current-features';
import UPCOMING_FEATURES from './upcoming-features';

const GITHUB_URL = 'https://github.com/muhsin7majeed/what-to-watch-web';

const Landing = () => {
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <Box minH="100vh">
      {/* Navbar */}
      <Box as="nav" position="sticky" top={0} zIndex={10} bg="bg" borderBottomWidth="1px" borderColor="border">
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack gap={2}>
              <Icon fontSize="2xl" color="darkorange">
                <LuTv />
              </Icon>
              <Heading size="lg">What to Watch</Heading>
            </HStack>

            <HStack gap={2}>
              <IconButton variant="ghost" size="sm" onClick={() => toggleColorMode()}>
                {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
              </IconButton>
              <ChakraLink asChild>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <IconButton variant="ghost" size="sm">
                    <LuGithub />
                  </IconButton>
                </a>
              </ChakraLink>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button colorPalette="darkorange" size="sm" asChild>
                <Link to="/auth/register">Sign Up</Link>
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box py={{ base: 16, md: 24 }} bg="bg.subtle" position="relative" overflow="hidden">
        <Container maxW="4xl" textAlign="center" position="relative" zIndex={1}>
          <Badge colorPalette="darkorange" size="lg" mb={4}>
            Open Source & Privacy-First
          </Badge>
          <Heading size={{ base: '3xl', md: '5xl' }} mb={6} lineHeight="tight">
            Your movies. Your data.{' '}
            <Text as="span" color="darkorange">
              Your rules.
            </Text>
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg.muted" mb={8} maxW="2xl" mx="auto">
            A privacy-focused movie and TV show tracker that doesn't sell your viewing habits to advertisers. Track what
            you've watched, save what you want to see, and actually own your data.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button colorPalette="darkorange" size="lg" asChild>
              <Link to="/auth/register">Get Started - It's Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <LuGithub />
                View on GitHub
              </a>
            </Button>
          </HStack>
          <Text fontSize="sm" color="fg.muted" mt={4}>
            No credit card required. Self-host anytime.
          </Text>
        </Container>
      </Box>

      {/* Current Features */}
      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="6xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Badge colorPalette="green">Available Now</Badge>
            <Heading size={{ base: '2xl', md: '3xl' }}>What you can do today</Heading>
            <Text fontSize="lg" color="fg.muted" maxW="2xl">
              No waitlist, no "coming soon" for basic features. This stuff works right now.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {CURRENT_FEATURES.map((feature) => (
              <Card.Root key={feature.title} variant="outline">
                <Card.Body>
                  <VStack align="start" gap={3}>
                    <Box p={3} bg="darkorange/10" rounded="lg">
                      <Icon fontSize="xl" color="darkorange">
                        <feature.icon />
                      </Icon>
                    </Box>
                    <Heading size="md">{feature.title}</Heading>
                    <Text color="fg.muted">{feature.description}</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Upcoming Features */}
      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="6xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Badge colorPalette="orange">Coming Soon</Badge>
            <Heading size={{ base: '2xl', md: '3xl' }}>What we're building</Heading>
            <Text fontSize="lg" color="fg.muted" maxW="2xl">
              We're not just another tracker. Here's what's cooking.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {UPCOMING_FEATURES.map((feature) => (
              <Card.Root key={feature.title} variant="outline">
                <Card.Body>
                  <HStack align="start" gap={4}>
                    <Box p={3} bg="orange.500/10" rounded="lg" flexShrink={0}>
                      <Icon fontSize="xl" color="orange.500">
                        <feature.icon />
                      </Icon>
                    </Box>
                    <VStack align="start" gap={2}>
                      <HStack>
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

      {/* Self-Hosting Highlight */}
      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="4xl">
          <Card.Root variant="outline" borderColor="darkorange/30" bg="darkorange/5">
            <Card.Body py={10}>
              <VStack gap={6} textAlign="center">
                <Box p={4} bg="darkorange/10" rounded="full">
                  <Icon fontSize="3xl" color="darkorange">
                    <LuGlobe />
                  </Icon>
                </Box>
                <Heading size={{ base: 'xl', md: '2xl' }}>Your Server, Your Cinema</Heading>
                <Text fontSize="lg" color="fg.muted" maxW="xl">
                  Don't want your watch history on someone else's server? Fork the repo, deploy with Docker, and run
                  your own instance. Modify it however you want. It's MIT licensed - go wild.
                </Text>
                <Button variant="outline" colorPalette="darkorange" asChild>
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                    <LuGithub />
                    Check out the repo
                  </a>
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Container>
      </Box>

      {/* FAQ */}
      <Box py={{ base: 16, md: 20 }} bg="bg.subtle">
        <Container maxW="3xl">
          <VStack gap={4} mb={12} textAlign="center">
            <Heading size={{ base: '2xl', md: '3xl' }}>Frequently Asked Questions</Heading>
            <Text fontSize="lg" color="fg.muted">
              Got questions? We've got answers. Probably.
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

      {/* Final CTA */}
      <Box py={{ base: 16, md: 20 }}>
        <Container maxW="4xl" textAlign="center">
          <Heading size={{ base: '2xl', md: '3xl' }} mb={4}>
            Ready to take control?
          </Heading>
          <Text fontSize="lg" color="fg.muted" mb={8}>
            Join the folks who are tired of being the product. Start tracking your movies and shows the way it should
            be.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button colorPalette="darkorange" size="lg" asChild>
              <Link to="/auth/register">Create Free Account</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth/login">Login</Link>
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box borderTopWidth="1px" borderColor="border" py={8}>
        <Container maxW="6xl">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
            <HStack gap={2}>
              <Icon fontSize="xl" color="darkorange">
                <LuTv />
              </Icon>
              <Text fontWeight="semibold">What to Watch</Text>
            </HStack>

            <Text color="fg.muted" fontSize="sm">
              Open source. Privacy-first. Built with ❤️ and honestly wayy less coffee!.
            </Text>

            <HStack gap={4}>
              <ChakraLink asChild>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <HStack gap={1} color="fg.muted" _hover={{ color: 'fg' }}>
                    <LuGithub />
                    <Text fontSize="sm">GitHub</Text>
                  </HStack>
                </a>
              </ChakraLink>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
