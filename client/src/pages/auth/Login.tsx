import { Box, Text } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { authAtom, setAuth } from '@/store/auth';
import { LocationState } from '@/types';
import AuthForm from './AuthForm';
import { LoginInputs } from './AuthForm';
import useLogin from '@/apis/useLogin';

const Login = () => {
  const [, setAuthState] = useAtom(authAtom);
  const navigate = useNavigate();
  const location = useLocation();

  const { mutate } = useLogin();

  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    mutate(data, {
      onSuccess: (data) => {
        console.log('SUCCESS YO');

        // setAuthState(setAuth(data.user, data.token));
        // navigate('/', { replace: true });
      },
    });

    // const dummyToken = 'dummy.jwt.token';
    // const dummyUser = { id: '1', username: data.username };
    // setAuthState(setAuth(dummyUser, dummyToken));
    // const from = (location.state as LocationState)?.from?.pathname || '/';
    // navigate(from, { replace: true });
  };

  return (
    <>
      <Box>
        <AuthForm onSubmit={onSubmit} type="login" />

        <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">
          Don't have an account?{' '}
          <Text as="span" color="purple.400">
            <Link to="/auth/register">Register</Link>
          </Text>
        </Text>
      </Box>
    </>
  );
};

export default Login;
