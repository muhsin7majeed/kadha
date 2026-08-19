import { useState } from 'react';
import { Button, Field, Fieldset, Input, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuKeyRound } from 'react-icons/lu';
import { Link, useLocation, useNavigate } from 'react-router';

import useRecoverAccount from '@/features/auth/api/use-recover-account';
import { RecoverAccountInputs } from '@/features/auth/auth.types';
import RecoveryCodeDisplay from '@/features/auth/components/recovery-code-display';
import { clearSession } from '@/features/auth/session';
import { LocationState } from '@/types/common';

interface RecoveryResult {
  recoveryCode: string;
  username: string;
}

const RecoverAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(null);
  const { mutate: recoverAccount, isPending, reset: resetMutation } = useRecoverAccount();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecoverAccountInputs>({
    defaultValues: {
      username: '',
      recoveryCode: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const from = (location.state as LocationState)?.from || '/app';
  const newPassword = watch('newPassword');

  const onSubmit: SubmitHandler<RecoverAccountInputs> = (payload) => {
    recoverAccount(payload, {
      onSuccess: async (data) => {
        await clearSession();
        setRecoveryResult({
          username: payload.username,
          recoveryCode: data.recoveryCode,
        });
        resetMutation();
      },
    });
  };

  if (recoveryResult) {
    return (
      <RecoveryCodeDisplay
        continueLabel="Return to login"
        heading="Save your new recovery code"
        recoveryCode={recoveryResult.recoveryCode}
        username={recoveryResult.username}
        onContinue={() => {
          setRecoveryResult(null);
          navigate('/auth/login', { replace: true, state: { from } });
        }}
      />
    );
  }

  return (
    <Stack gap={5}>
      <Stack gap={2} textAlign="center">
        <Text as="h2" textStyle="sectionTitle">
          Recover your account
        </Text>
        <Text color="fg.muted" textStyle="supporting">
          Enter the recovery code you saved when you created or secured this account. Without it, Kadha cannot reset
          your password.
        </Text>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root size="lg" maxW="md" disabled={isPending}>
          <Fieldset.Content>
            <Field.Root invalid={Boolean(errors.username)} required>
              <Field.Label>Username</Field.Label>
              <Input
                type="text"
                autoComplete="username"
                {...register('username', { required: 'Username is required' })}
              />
              <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={Boolean(errors.recoveryCode)} required>
              <Field.Label>Recovery code</Field.Label>
              <Input
                type="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                {...register('recoveryCode', {
                  required: 'Recovery code is required',
                })}
              />
              <Field.HelperText>Spaces, hyphens, and letter case do not affect the code.</Field.HelperText>
              <Field.ErrorText>{errors.recoveryCode?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={Boolean(errors.newPassword)} required>
              <Field.Label>New password</Field.Label>
              <Input
                type="password"
                autoComplete="new-password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                })}
              />
              <Field.ErrorText>{errors.newPassword?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={Boolean(errors.confirmNewPassword)} required>
              <Field.Label>Confirm new password</Field.Label>
              <Input
                type="password"
                autoComplete="new-password"
                {...register('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                })}
              />
              <Field.ErrorText>{errors.confirmNewPassword?.message}</Field.ErrorText>
            </Field.Root>

            <Button type="submit" colorPalette="brand" loading={isPending} disabled={isPending}>
              <LuKeyRound />
              Reset password
            </Button>
          </Fieldset.Content>
        </Fieldset.Root>
      </form>

      <Text textStyle="supporting" color="fg.muted" textAlign="center">
        Remembered your password?{' '}
        <ChakraLink asChild color="brand.fg">
          <Link to="/auth/login" state={{ from }}>
            Return to login
          </Link>
        </ChakraLink>
      </Text>
    </Stack>
  );
};

export default RecoverAccount;
