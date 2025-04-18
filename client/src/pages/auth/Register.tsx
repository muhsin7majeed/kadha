import { Box, Text } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { LocationState } from '@/types/general';
import AuthForm, { RegisterInputs } from './AuthForm';
import useRegister from './apis/useRegister';
import { useLoginAuth } from '@/lib/auth';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLoginAuth();

  const from = (location.state as LocationState)?.from || '/app';

  const { mutate, error, isPending } = useRegister();

  const onSubmit: SubmitHandler<RegisterInputs> = (payload) => {
    mutate(payload, {
      onSuccess: (data) => {
        login({
          user: { _id: data.userId, username: payload.username },
          token: data.token,
          isLoading: false,
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
