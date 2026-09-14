import { useRef, useState, type KeyboardEvent, type UIEvent } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Text,
  useMediaQuery,
  VisuallyHidden,
  VStack,
} from '@chakra-ui/react';

const SLIDES = [
  {
    title: 'Your year at a glance',
    description: 'See movies, rewatches, and individual episodes across a private viewing diary.',
    src: '/assets/images/kadha-diary-screen.webp',
    alt: 'Kadha Diary Insights showing annual viewing totals and an activity calendar',
  },
  {
    title: 'Always know what is next',
    description: 'Follow several series at once and jump straight to the next aired episode.',
    src: '/assets/images/kadha-tv-progress-screen.webp',
    alt: 'Kadha In Progress page showing episode progress for several TV series',
  },
  {
    title: 'Share one list, not your whole profile',
    description: 'Publish a read-only collection while the rest of your viewing stays private.',
    src: '/assets/images/kadha-collection-screen.webp',
    alt: 'A public Kadha collection with six movies and TV series shared by its owner',
  },
  {
    title: 'Privacy in plain sight',
    description: 'Choose separate visibility rules for your profile, watched list, likes, and watchlist.',
    src: '/assets/images/kadha-privacy-settings-screen.webp',
    alt: 'Kadha privacy settings with separate visibility controls for profile sections',
  },
] as const;

const ProductShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion] = useMediaQuery(['(prefers-reduced-motion: reduce)'], { fallback: [true] });

  const goTo = (nextIndex: number) => {
    const index = (nextIndex + SLIDES.length) % SLIDES.length;
    const viewport = viewportRef.current;
    const slide = viewport?.children.item(index) as HTMLElement | null;

    setActiveIndex(index);
    if (viewport && slide && typeof viewport.scrollTo === 'function') {
      viewport.scrollTo({ left: slide.offsetLeft, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    if (viewport.clientWidth === 0) return;
    setActiveIndex(Math.round(viewport.scrollLeft / viewport.clientWidth));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  };

  return (
    <Box as="section" py={{ base: 16, md: 20 }}>
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <VStack gap={4} mb={{ base: 8, md: 12 }} textAlign="center">
          <Badge colorPalette="brand">Inside Kadha</Badge>
          <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
            Built around your viewing history
          </Heading>
          <Text color="fg.muted" textStyle="lead" maxW="2xl">
            Keep a private record for yourself, then share collections only when it helps.
          </Text>
        </VStack>

        <Box
          role="region"
          aria-roledescription="carousel"
          aria-label="Kadha product tour"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          outline="none"
          _focusVisible={{ boxShadow: '0 0 0 3px var(--chakra-colors-color-palette-focus-ring)' }}
          rounded="xl"
        >
          <Box
            position="relative"
            maxW="5xl"
            mx="auto"
            p={{ base: '1', md: '2' }}
            pt={{ base: '1', md: '4' }}
            bg="gray.950"
            borderWidth="1px"
            borderColor="gray.700"
            rounded={{ base: 'lg', md: '2xl' }}
            shadow="xl"
            _before={{
              content: '""',
              display: { base: 'none', md: 'block' },
              position: 'absolute',
              top: '1.5',
              left: '50%',
              transform: 'translateX(-50%)',
              boxSize: '1.5',
              rounded: 'full',
              bg: 'gray.600',
            }}
          >
            <Flex
              ref={viewportRef}
              overflowX="auto"
              rounded={{ base: 'md', md: 'lg' }}
              scrollSnapType="x mandatory"
              overscrollBehaviorX="contain"
              onScroll={handleScroll}
              css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
            >
              {SLIDES.map((slide, index) => (
                <Box
                  as="figure"
                  key={slide.title}
                  minW="full"
                  m="0"
                  position="relative"
                  scrollSnapAlign="start"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${SLIDES.length}: ${slide.title}`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width="1600"
                    height="813"
                    display="block"
                    w="full"
                    aspectRatio="1600 / 813"
                    objectFit="cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <Box
                    as="figcaption"
                    position="absolute"
                    insetEnd={{ base: 2, md: 5 }}
                    bottom={{ base: 2, md: 5 }}
                    maxW={{ base: '75%', md: 'md' }}
                    px={{ base: 3, md: 4 }}
                    py={{ base: 2, md: 3 }}
                    bg="blackAlpha.800"
                    color="white"
                    borderWidth="1px"
                    borderColor="whiteAlpha.300"
                    rounded="lg"
                    backdropFilter="blur(10px)"
                    shadow="lg"
                  >
                    <Text fontWeight="semibold" textStyle={{ base: 'compactLabel', md: 'sectionTitle' }}>
                      {slide.title}
                    </Text>
                    <Text display={{ base: 'none', sm: 'block' }} mt="1" color="whiteAlpha.800" textStyle="supporting">
                      {slide.description}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Box>

          <Box display={{ base: 'none', md: 'block' }} maxW="5xl" mx="auto">
            <Box h="3" mx="auto" w="94%" bg="gray.700" roundedBottom="2xl" />
            <Box h="1.5" mx="auto" w="22%" bg="gray.600" roundedBottom="full" />
          </Box>

          <VisuallyHidden role="status" aria-live="polite">
            {SLIDES[activeIndex].title}, slide {activeIndex + 1} of {SLIDES.length}
          </VisuallyHidden>

          <HStack justify="center" gap="2" mt={{ base: 5, md: 7 }}>
            <IconButton
              aria-label="Previous screenshot"
              size="sm"
              variant="outline"
              colorPalette="gray"
              rounded="full"
              onClick={() => goTo(activeIndex - 1)}
            >
              <LuChevronLeft />
            </IconButton>

            <HStack gap="1" aria-label="Choose a screenshot">
              {SLIDES.map((slide, index) => {
                const active = index === activeIndex;
                return (
                  <Button
                    type="button"
                    key={slide.title}
                    minW="8"
                    p="0"
                    variant="plain"
                    aria-label={`Show ${slide.title}`}
                    aria-current={active ? 'true' : undefined}
                    boxSize="8"
                    display="grid"
                    placeItems="center"
                    rounded="full"
                    onClick={() => goTo(index)}
                    _focusVisible={{ outline: '2px solid', outlineColor: 'brand.focusRing', outlineOffset: '2px' }}
                  >
                    <Box
                      w={active ? '5' : '2'}
                      h="2"
                      rounded="full"
                      bg={active ? 'brand.solid' : 'border.emphasized'}
                      transition={prefersReducedMotion ? undefined : 'width 160ms ease'}
                    />
                  </Button>
                );
              })}
            </HStack>

            <IconButton
              aria-label="Next screenshot"
              size="sm"
              variant="outline"
              colorPalette="gray"
              rounded="full"
              onClick={() => goTo(activeIndex + 1)}
            >
              <LuChevronRight />
            </IconButton>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductShowcase;
