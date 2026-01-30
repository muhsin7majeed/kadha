import { Box, Button, Container, Flex, Heading, HStack, Icon, IconButton, Link as ChakraLink } from '@chakra-ui/react';
import { LuGithub, LuMoon, LuSun, LuTv } from 'react-icons/lu';
import { Link } from 'react-router';
import { useAuthAtom } from '@/atoms/auth-atom';

import NotificationButton from '../notification-button';
import ProfileMenu from './profile-menu';
import { useColorMode } from '../ui/color-mode';

const GITHUB_URL = 'https://github.com/muhsin7majeed/what-to-watch-web';

const Navbar = () => {
  const [auth] = useAuthAtom();
  const { toggleColorMode, colorMode } = useColorMode();

  const isAuthenticated = auth.status === 'authenticated';

  return (
    <>
      <Box as="nav" position="sticky" top={0} zIndex={10} bg="bg" borderBottomWidth="1px" borderColor="border">
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack gap={2} asChild>
              <Link to={isAuthenticated ? '/app' : '/'}>
                <Icon fontSize="2xl" color="orange">
                  <LuTv />
                </Icon>
                <Heading size="lg">What to Watch</Heading>
              </Link>
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

              {isAuthenticated ? (
                <Flex gap={4}>
                  <NotificationButton />

                  <ProfileMenu />
                </Flex>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild display={{ base: 'none', sm: 'flex' }}>
                    <Link to="/auth/login">Login</Link>
                  </Button>

                  <Button colorPalette="orange" size="sm" asChild display={{ base: 'none', sm: 'flex' }}>
                    <Link to="/auth/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Navbar;
