import { Box, Link as ChakraLink, Text, VStack } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { LocationState } from '@/types/common';
import AuthForm from './auth-form';
import useRegister from '@/features/auth/api/use-register';
import { RegisterInputs } from '@/features/auth/auth.types';
import { setAccessToken } from '@/lib/token-manager';
import { useQueryClient } from '@tanstack/react-query';
import { getApiFieldError } from '@/hooks/use-error-handler';
import { getMe } from '@/features/user/api/use-get-me';
import { queryKeys } from '@/lib/query-keys';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const from = (location.state as LocationState)?.from || '/app';

  const { mutate, error, isPending } = useRegister();
  const usernameApiError = getApiFieldError(error, 'username');
  const watchRegionApiError = getApiFieldError(error, 'watchRegion');

  const onSubmit: SubmitHandler<RegisterInputs> = (payload) => {
    mutate(payload, {
      onSuccess: async (data) => {
        setAccessToken(data.accessToken);
        queryClient.clear();
        await queryClient.fetchQuery({
          queryKey: queryKeys.me,
          queryFn: getMe,
          staleTime: Infinity,
        });

        navigate(from, { replace: true });
      },
    });
  };

  return (
    <Box>
      <VStack align="stretch" gap={4}>
        <Box bg="bg.subtle" borderWidth="1px" borderColor="border" rounded="md" p={4}>
          <Text fontSize="sm" color="fg.muted">
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

      <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">
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
