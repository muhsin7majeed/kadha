import { Box, Text } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { LocationState } from '@/types/common';
import useLogin from '@/pages/auth/apis/use-login';
import AuthForm from './auth-form';
import { LoginInputs } from './auth-form';
import { setAccessToken } from '@/lib/token-manager';
import { useSetAuthAtom } from '@/atoms/auth-atom';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSetAuthAtom();

  const { mutate, isPending } = useLogin();

  const from = (location.state as LocationState)?.from || '/app';

  const onSubmit: SubmitHandler<LoginInputs> = (payload) => {
    mutate(payload, {
      onSuccess: (data) => {
        console.log(data);

        setAccessToken(data.accessToken);
        setAuth({
          user: {
            id: data.userId,
            username: payload.username,
          },
          status: "authenticated"
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
