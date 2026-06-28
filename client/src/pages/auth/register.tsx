import { Box, Text } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { LocationState } from '@/types/common';
import AuthForm from './auth-form';
import useRegister from '@/features/auth/api/use-register';
import { RegisterInputs } from '@/features/auth/auth.types';
import { setAccessToken } from '@/lib/token-manager';
import { useSetAuthAtom } from '@/atoms/auth-atom';
import { useQueryClient } from '@tanstack/react-query';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSetAuthAtom();
  const queryClient = useQueryClient();

  const from = (location.state as LocationState)?.from || '/app';

  const { mutate, error, isPending } = useRegister();

  const onSubmit: SubmitHandler<RegisterInputs> = (payload) => {
    mutate(payload, {
      onSuccess: (data) => {
        setAccessToken(data.accessToken);
        queryClient.clear();
        setAuth({
          user: {
            id: data.userId,
            username: payload.username,
          },
          status: 'authenticated',
        });

        navigate(from, { replace: true });
      },
    });
  };

  return (
    <Box>
      <AuthForm
        onSubmit={onSubmit}
        type="register"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiFieldErrors={(error as any)?.response?.data?.fieldErrors}
        isLoading={isPending}
      />

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
