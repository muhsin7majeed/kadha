import { useState } from 'react';
import { Box, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import useRegister from '@/features/auth/api/use-register';
import { RegisterInputs, RegisterResponse } from '@/features/auth/auth.types';
import RecoveryCodeDisplay from '@/features/auth/components/recovery-code-display';
import { getMe } from '@/features/user/api/use-get-me';
import { getApiFieldError } from '@/hooks/use-error-handler';
import { queryKeys } from '@/lib/query-keys';
import { setAccessToken } from '@/lib/token-manager';
import { LocationState } from '@/types/common';
import AuthForm from './auth-form';

interface PendingRegistration extends RegisterResponse {
  username: string;
}

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);

  const from = (location.state as LocationState)?.from || '/app';

  const { mutate, error, isPending, reset: resetRegistration } = useRegister();
  const usernameApiError = getApiFieldError(error, 'username');
  const watchRegionApiError = getApiFieldError(error, 'watchRegion');

  const onSubmit: SubmitHandler<RegisterInputs> = (payload) => {
    mutate(payload, {
      onSuccess: (data) => {
        setPendingRegistration({
          ...data,
          username: payload.username,
        });
        resetRegistration();
      },
    });
  };

  const completeRegistration = async () => {
    if (!pendingRegistration) {
      return;
    }

    setAccessToken(pendingRegistration.accessToken);
    queryClient.clear();
    await queryClient.fetchQuery({
      queryKey: queryKeys.me,
      queryFn: getMe,
      staleTime: Infinity,
    });

    setPendingRegistration(null);
    navigate(from, { replace: true });
  };

  if (pendingRegistration) {
    return (
      <RecoveryCodeDisplay
        continueLabel="Continue to Kadha"
        recoveryCode={pendingRegistration.recoveryCode}
        username={pendingRegistration.username}
        onContinue={completeRegistration}
      />
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={4}>
        <Box bg="bg.subtle" borderWidth="1px" borderColor="border" rounded="md" p={4}>
          <Text textStyle="supporting" color="fg.muted">
            This hosted beta is not end-to-end encrypted yet, the instance operator can access stored account and media
            data. Self-host Kadha if you want full control of your data.
          </Text>
        </Box>

        <AuthForm
          onSubmit={onSubmit}
          type="register"
          apiFieldErrors={{
            ...(usernameApiError ? { username: usernameApiError } : {}),
            ...(watchRegionApiError ? { watchRegion: watchRegionApiError } : {}),
          }}
          isLoading={isPending}
        />
      </VStack>

      <Text mt={4} fontSize="xs" color="fg.muted" textAlign="center">
        By creating an account, you agree to the{' '}
        <ChakraLink asChild color="brand.fg">
          <Link to="/terms">Terms</Link>
        </ChakraLink>{' '}
        and acknowledge the{' '}
        <ChakraLink asChild color="brand.fg">
          <Link to="/privacy">Privacy Policy</Link>
        </ChakraLink>
        .
      </Text>

      <Text mt={4} textStyle="supporting" color="gray.500" textAlign="center">
        Already have an account?{' '}
        <Text as="span" color="purple.400">
          <Link to="/auth/login" state={{ from }}>
            Login
          </Link>
        </Text>
      </Text>
    </Box>
  );
};

export default Register;
