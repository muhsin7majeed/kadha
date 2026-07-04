import { Button, Field, Fieldset, Input, NativeSelect } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuArrowRight, LuLogIn } from 'react-icons/lu';

import { getBrowserWatchRegion, WATCH_REGIONS } from '@/constants/watch-regions';
import { LoginInputs, RegisterInputs } from '@/features/auth/auth.types';

interface AuthFormProps {
  apiFieldErrors?: Partial<Record<'username' | 'watchRegion', string>>;
  isLoading?: boolean;
  type: 'register' | 'login';
  onSubmit: SubmitHandler<LoginInputs> | SubmitHandler<RegisterInputs>;
}

const AuthForm = ({ onSubmit, type, apiFieldErrors, isLoading }: AuthFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginInputs | RegisterInputs>({
    defaultValues: {
      username: '',
      password: '',
      watchRegion: getBrowserWatchRegion(),
    },
  });

  const isRegister = type === 'register';
  const password = watch('password');

  const registerErrors = errors as Record<string, { message?: string }>;

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<LoginInputs | RegisterInputs>)}>
      <Fieldset.Root size="lg" maxW="md">
        <Fieldset.Content>
          <Field.Root invalid={!!errors.username || !!apiFieldErrors?.username}>
            <Field.Label srOnly>Username</Field.Label>
            <Input type="text" {...register('username', { required: 'Username is required' })} placeholder="Username" />
            <Field.ErrorText>{errors.username?.message || apiFieldErrors?.username}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label srOnly>Password</Field.Label>
            <Input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters long' },
              })}
              placeholder="Password"
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          {isRegister && (
            <>
              <Field.Root invalid={!!registerErrors.confirmPassword}>
                <Field.Label srOnly>Confirm password</Field.Label>
                <Input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  placeholder="Confirm Password"
                />
                <Field.ErrorText>{registerErrors.confirmPassword?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!registerErrors.watchRegion || !!apiFieldErrors?.watchRegion} required>
                <Field.Label>Country</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field {...register('watchRegion', { required: 'Country is required' })}>
                    {WATCH_REGIONS.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Field.HelperText>Used to show streaming availability in your region.</Field.HelperText>
                <Field.ErrorText>{registerErrors.watchRegion?.message || apiFieldErrors?.watchRegion}</Field.ErrorText>
              </Field.Root>
            </>
          )}

          <Button type="submit" variant="surface" colorPalette="brand" loading={isLoading} disabled={isLoading}>
            {isRegister ? 'Register' : 'Login'} {isRegister ? <LuArrowRight /> : <LuLogIn />}
          </Button>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
};

export default AuthForm;
