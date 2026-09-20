import { Button, Card, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { LuLogOut } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import useLogoutAll from '@/features/auth/api/use-logout-all';
import { clearSession } from '@/features/auth/session';
import { removeCurrentPushSubscription } from '@/features/notifications/api/use-push-notifications';
import { toaster } from '@/components/ui/toaster-store';

interface LogoutAllSectionProps {
  headingAs?: 'h2' | 'h3';
}

const LogoutAllSection = ({ headingAs = 'h2' }: LogoutAllSectionProps) => {
  const navigate = useNavigate();
  const { mutate: logoutAll, isPending } = useLogoutAll();

  const handleLogoutAll = async () => {
    await removeCurrentPushSubscription().catch(() => undefined);
    logoutAll(undefined, {
      onSuccess: async () => {
        await clearSession();
        toaster.success({ title: 'Logged out on every device.' });
        navigate('/auth/login', { replace: true });
      },
    });
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap={2}>
          <LuLogOut aria-hidden />
          <Heading as={headingAs} textStyle="subsectionTitle">
            Log out everywhere
          </Heading>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          End every active session for your account, including this device.
        </Text>
      </Card.Header>

      <Card.Body>
        <Stack align={{ base: 'stretch', md: 'start' }}>
          <Button colorPalette="gray" variant="outline" loading={isPending} disabled={isPending} onClick={handleLogoutAll}>
            <LuLogOut />
            Log out everywhere
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default LogoutAllSection;
