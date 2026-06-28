import { Box, Text } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { LocationState } from '@/types/common';
import useLogin from '@/features/auth/api/use-login';
import AuthForm from './auth-form';
import { LoginInputs } from '@/features/auth/auth.types';
import { setAccessToken } from '@/lib/token-manager';
import { useSetAuthAtom } from '@/atoms/auth-atom';
import { useQueryClient } from '@tanstack/react-query';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSetAuthAtom();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useLogin();

  const from = (location.state as LocationState)?.from || '/app';

  const onSubmit: SubmitHandler<LoginInputs> = (payload) => {
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
      <AuthForm onSubmit={onSubmit} type="login" isLoading={isPending} />

      <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">
        Don't have an account?{' '}
        <Text as="span" color="purple.400">
          <Link to="/auth/register" state={{ from }}>
            Register
          </Link>
        </Text>
      </Text>
    </Box>
  );
};

export default Login;
