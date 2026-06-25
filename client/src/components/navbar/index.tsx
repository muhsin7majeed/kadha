import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react';
import { LuGithub, LuMoon, LuSun, LuTv } from 'react-icons/lu';
import { Link } from 'react-router';
import { useAuthAtom } from '@/atoms/auth-atom';
import { APP_CONFIG } from '@/config/app-config';

import NotificationButton from '../notification-button';
import ProfileMenu from './profile-menu';
import { useColorMode } from '../ui/color-mode';

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
                <Icon fontSize={['sm', '2xl']} color="orange">
                  <LuTv />
                </Icon>
                <Heading size={['sm', 'lg']} textOverflow="ellipsis">
                  {APP_CONFIG.appName}
                </Heading>
              </Link>
            </HStack>

            <HStack gap={2}>
              <Text color="fg.muted" fontSize="xs" lineHeight="1" whiteSpace="nowrap">
                v{APP_CONFIG.version}
              </Text>

              <IconButton variant="ghost" size="sm" onClick={() => toggleColorMode()}>
                {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
              </IconButton>

              <ChakraLink asChild>
                <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
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
