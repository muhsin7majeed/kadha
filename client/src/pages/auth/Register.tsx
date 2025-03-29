import { Box, Text } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAtom } from 'jotai';

import { authAtom, setAuth } from '@/store/auth';
import { LocationState } from '@/types';
import AuthForm, { RegisterInputs } from './AuthForm';

const Register = () => {
  const [, setAuthState] = useAtom(authAtom);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit: SubmitHandler<RegisterInputs> = (data) => {
    const dummyToken = 'dummy.jwt.token';
    const dummyUser = { id: '1', username: data.username };

    setAuthState(setAuth(dummyUser, dummyToken));

    const from = (location.state as LocationState)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  return (
    <>
      <Box>
        <AuthForm onSubmit={onSubmit} type="register" />

        <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">
          Already have an account?{' '}
          <Text as="span" color="purple.400">
            <Link to="/auth/login">Login</Link>
          </Text>
        </Text>
      </Box>
    </>
  );
};

export default Register;
