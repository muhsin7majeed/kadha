import { Button, Card, Field, Fieldset, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuKeyRound } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import useChangePassword from '@/features/auth/api/use-change-password';
import { ChangePasswordInputs } from '@/features/auth/auth.types';
import PasswordGuidance from '@/features/auth/components/password-guidance';
import PasswordInput from '@/features/auth/components/password-input';
import { clearSession } from '@/features/auth/session';
import { useAuth } from '@/features/auth/use-auth';
import { getApiFieldError } from '@/hooks/use-error-handler';
import { toaster } from '@/components/ui/toaster-store';

interface ChangePasswordSectionProps {
  headingAs?: 'h2' | 'h3';
}

const ChangePasswordSection = ({ headingAs = 'h2' }: ChangePasswordSectionProps) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { mutate: changePassword, error, isPending, reset: resetMutation } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInputs>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });
  const newPassword = watch('newPassword');
  const currentPasswordError = errors.currentPassword?.message || getApiFieldError(error, 'currentPassword');
  const newPasswordError = errors.newPassword?.message || getApiFieldError(error, 'newPassword');

  const onSubmit: SubmitHandler<ChangePasswordInputs> = (payload) => {
    changePassword(payload, {
      onSuccess: async () => {
        reset();
        resetMutation();
        await clearSession();
        toaster.success({ title: 'Password changed. Log in again on this device.' });
        navigate('/auth/login', { replace: true });
      },
    });
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap={2}>
          <LuKeyRound aria-hidden />
          <Heading as={headingAs} textStyle="subsectionTitle">
            Change password
          </Heading>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          Changing your password signs you out on every device, including this one.
        </Text>
      </Card.Header>

      <Card.Body>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Fieldset.Root disabled={isPending}>
            <Fieldset.Content>
              <Field.Root invalid={Boolean(currentPasswordError)} required>
                <Field.Label>Current password</Field.Label>
                <PasswordInput
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  {...register('currentPassword', { required: 'Current password is required' })}
                />
                <Field.ErrorText>{currentPasswordError}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={Boolean(newPasswordError)} required>
                <Field.Label>New password</Field.Label>
                <PasswordInput
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby="change-password-guidance"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long',
                    },
                  })}
                />
                <Field.ErrorText>{newPasswordError}</Field.ErrorText>
              </Field.Root>

              <PasswordGuidance
                id="change-password-guidance"
                password={newPassword}
                username={auth.user?.username ?? ''}
              />

              <Field.Root invalid={Boolean(errors.confirmNewPassword)} required>
                <Field.Label>Confirm new password</Field.Label>
                <PasswordInput
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  {...register('confirmNewPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                />
                <Field.ErrorText>{errors.confirmNewPassword?.message}</Field.ErrorText>
              </Field.Root>

              <Stack align={{ base: 'stretch', md: 'start' }}>
                <Button type="submit" colorPalette="brand" loading={isPending} disabled={isPending}>
                  <LuKeyRound />
                  Change password
                </Button>
              </Stack>
            </Fieldset.Content>
          </Fieldset.Root>
        </form>
      </Card.Body>
    </Card.Root>
  );
};

export default ChangePasswordSection;
