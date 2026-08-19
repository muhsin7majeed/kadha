import { Button, Field, Fieldset, Heading, Input, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuArrowRight, LuLogIn } from 'react-icons/lu';

import { getBrowserWatchRegion, WATCH_REGIONS } from '@/constants/watch-regions';
import { LoginInputs, RegisterInputs } from '@/features/auth/auth.types';
import PasswordGuidance from '@/features/auth/components/password-guidance';
import PasswordInput from '@/features/auth/components/password-input';

interface AuthFormProps {
  apiFieldErrors?: Partial<Record<'username' | 'watchRegion', string>>;
  apiError?: string;
  isLoading?: boolean;
  type: 'register' | 'login';
  onSubmit: SubmitHandler<LoginInputs> | SubmitHandler<RegisterInputs>;
}

const AuthForm = ({ onSubmit, type, apiFieldErrors, apiError, isLoading }: AuthFormProps) => {
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
  const username = watch('username');
  const password = watch('password');
  const headingId = `${type}-form-heading`;
  const passwordErrorId = `${type}-password-error`;
  const passwordDescriptionIds = [
    isRegister ? 'registration-password-guidance' : undefined,
    errors.password ? passwordErrorId : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const registerErrors = errors as Record<string, { message?: string }>;

  return (
    <form
      aria-labelledby={headingId}
      noValidate
      onSubmit={handleSubmit(onSubmit as SubmitHandler<LoginInputs | RegisterInputs>)}
    >
      <Stack gap={4}>
        <Heading id={headingId} as="h2" textStyle="sectionTitle" textAlign="center">
          {isRegister ? 'Create your account' : 'Log in to your account'}
        </Heading>

        {apiError && (
          <Text role="alert" color="red.fg" textStyle="supporting" textAlign="center">
            {apiError}
          </Text>
        )}

        <Fieldset.Root size="lg" maxW="md">
          <Fieldset.Content>
            <Field.Root id={`${type}-username`} invalid={!!errors.username || !!apiFieldErrors?.username} required>
              <Field.Label>Username</Field.Label>
              <Input
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                {...register('username', { required: 'Username is required' })}
              />
              <Field.ErrorText>{errors.username?.message || apiFieldErrors?.username}</Field.ErrorText>
            </Field.Root>

            <Field.Root id={`${type}-password`} invalid={!!errors.password} required>
              <Field.Label>Password</Field.Label>
              <PasswordInput
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby={passwordDescriptionIds || undefined}
                {...register('password', {
                  required: 'Password is required',
                  ...(isRegister
                    ? {
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters long',
                        },
                      }
                    : {}),
                })}
              />
              <Field.ErrorText id={passwordErrorId}>{errors.password?.message}</Field.ErrorText>
            </Field.Root>

            {isRegister && (
              <>
                <PasswordGuidance password={password} username={username} />

                <Field.Root id="register-confirm-password" invalid={!!registerErrors.confirmPassword} required>
                  <Field.Label>Confirm password</Field.Label>
                  <PasswordInput
                    autoComplete="new-password"
                    autoCapitalize="none"
                    spellCheck={false}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                  />
                  <Field.ErrorText>{registerErrors.confirmPassword?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!registerErrors.watchRegion || !!apiFieldErrors?.watchRegion} required>
                  <Field.Label>Country</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register('watchRegion', {
                        required: 'Country is required',
                      })}
                    >
                      {WATCH_REGIONS.map((region) => (
                        <option key={region.code} value={region.code}>
                          {region.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Field.HelperText>Used to show streaming availability in your region.</Field.HelperText>
                  <Field.ErrorText>
                    {registerErrors.watchRegion?.message || apiFieldErrors?.watchRegion}
                  </Field.ErrorText>
                </Field.Root>
              </>
            )}

            <Button type="submit" variant="surface" colorPalette="brand" loading={isLoading} disabled={isLoading}>
              {isRegister ? 'Register' : 'Login'} {isRegister ? <LuArrowRight /> : <LuLogIn />}
            </Button>
          </Fieldset.Content>
        </Fieldset.Root>
      </Stack>
    </form>
  );
};

export default AuthForm;
