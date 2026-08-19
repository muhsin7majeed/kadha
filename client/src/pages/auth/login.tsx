import { Box, Link as ChakraLink, Text } from '@chakra-ui/react';
import { SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { LocationState } from '@/types/common';
import useLogin from '@/features/auth/api/use-login';
import AuthForm from './auth-form';
import { LoginInputs } from '@/features/auth/auth.types';
import { setAccessToken } from '@/lib/token-manager';
import { useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/features/user/api/use-get-me';
import { queryKeys } from '@/lib/query-keys';
import { getApiErrorMessage } from '@/hooks/use-error-handler';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { mutate, error, isPending } = useLogin();

  const from = (location.state as LocationState)?.from || '/app';

  const onSubmit: SubmitHandler<LoginInputs> = (payload) => {
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
      <AuthForm apiError={getApiErrorMessage(error)} onSubmit={onSubmit} type="login" isLoading={isPending} />

      <Text mt={4} textStyle="supporting" color="fg.muted" textAlign="center">
        <ChakraLink asChild color="brand.fg">
          <Link to="/auth/recover" state={{ from }}>
            Forgot password?
          </Link>
        </ChakraLink>
      </Text>

      <Text mt={4} textStyle="supporting" color="fg.muted" textAlign="center">
        Don't have an account?{' '}
        <ChakraLink asChild color="brand.fg">
          <Link to="/auth/register" state={{ from }}>
            Register
          </Link>
        </ChakraLink>
      </Text>
    </Box>
  );
};

export default Login;
