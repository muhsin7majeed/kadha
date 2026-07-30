import { useState } from 'react';
import { Button, Card, Field, Heading, HStack, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuKeyRound, LuRefreshCw, LuShieldPlus } from 'react-icons/lu';

import useManageRecoveryCode from '@/features/auth/api/use-manage-recovery-code';
import useRecoveryCodeStatus from '@/features/auth/api/use-recovery-code-status';
import { ManageRecoveryCodeInputs, ManageRecoveryCodeResponse } from '@/features/auth/auth.types';
import RecoveryCodeDisplay from '@/features/auth/components/recovery-code-display';
import { useAuth } from '@/features/auth/use-auth';

interface GeneratedRecoveryCode extends ManageRecoveryCodeResponse {
  isReplacement: boolean;
}

const formatCreatedAt = (createdAt: string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(createdAt));
};

const AccountRecoverySection = () => {
  const auth = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedRecoveryCode | null>(null);
  const { data: status, isError, isPending: isStatusPending, refetch } = useRecoveryCodeStatus();
  const { mutate: manageRecoveryCode, isPending: isManaging, reset: resetMutation } = useManageRecoveryCode();
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ManageRecoveryCodeInputs>({
    defaultValues: {
      currentPassword: '',
    },
  });

  const username = auth.user?.username;

  const onSubmit: SubmitHandler<ManageRecoveryCodeInputs> = (payload) => {
    const isReplacement = Boolean(status?.configured);

    manageRecoveryCode(payload, {
      onSuccess: (data) => {
        setGeneratedCode({
          ...data,
          isReplacement,
        });
        resetForm();
        resetMutation();
      },
    });
  };

  const closeForm = () => {
    resetForm();
    setIsFormVisible(false);
  };

  if (generatedCode && username) {
    return (
      <RecoveryCodeDisplay
        continueLabel="Done"
        generatedAt={new Date(generatedCode.createdAt)}
        heading={generatedCode.isReplacement ? 'Save your new recovery code' : 'Save your account recovery code'}
        recoveryCode={generatedCode.recoveryCode}
        username={username}
        onContinue={() => {
          setGeneratedCode(null);
          setIsFormVisible(false);
        }}
      />
    );
  }

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <HStack gap={2}>
          <LuKeyRound aria-hidden />
          <Heading textStyle="subsectionTitle">Account recovery</Heading>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          Use a private recovery code to reset your password without an email address or phone number.
        </Text>
      </Card.Header>

      <Card.Body>
        {isStatusPending ? (
          <HStack gap={2} color="fg.muted">
            <Spinner size="sm" />
            <Text textStyle="supporting">Checking recovery status…</Text>
          </HStack>
        ) : isError ? (
          <Stack align="start" gap={3}>
            <Text color="fg.error" textStyle="supporting">
              Could not load your recovery status.
            </Text>
            <Button type="button" variant="outline" colorPalette="gray" onClick={() => refetch()}>
              Try again
            </Button>
          </Stack>
        ) : isFormVisible ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={4}>
              <Text textStyle="body">
                {status?.configured
                  ? 'Your existing recovery code will stop working immediately.'
                  : 'Enter your current password to create a recovery code.'}
              </Text>

              <Field.Root invalid={Boolean(errors.currentPassword)} required>
                <Field.Label>Current password</Field.Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  disabled={isManaging}
                  {...register('currentPassword', {
                    required: 'Current password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                />
                <Field.ErrorText>{errors.currentPassword?.message}</Field.ErrorText>
              </Field.Root>

              <HStack gap={2} flexWrap="wrap">
                <Button type="submit" colorPalette="brand" loading={isManaging} disabled={isManaging}>
                  {status?.configured ? <LuRefreshCw /> : <LuShieldPlus />}
                  {status?.configured ? 'Replace recovery code' : 'Create recovery code'}
                </Button>
                <Button type="button" variant="outline" colorPalette="gray" disabled={isManaging} onClick={closeForm}>
                  Cancel
                </Button>
              </HStack>
            </Stack>
          </form>
        ) : (
          <Stack align="start" gap={4}>
            <Stack gap={1}>
              <Text fontWeight="semibold">
                {status?.configured ? 'Recovery code configured' : 'Recovery code not configured'}
              </Text>
              <Text color="fg.muted" textStyle="supporting">
                {status?.configured && status.createdAt
                  ? `Created ${formatCreatedAt(status.createdAt)}. Kadha stores only a one-way verifier and cannot reveal the code.`
                  : 'Without a recovery code, forgetting your password permanently locks you out of this account.'}
              </Text>
            </Stack>

            <Button
              type="button"
              variant={status?.configured ? 'outline' : 'solid'}
              colorPalette={status?.configured ? 'gray' : 'brand'}
              onClick={() => setIsFormVisible(true)}
            >
              {status?.configured ? <LuRefreshCw /> : <LuShieldPlus />}
              {status?.configured ? 'Replace recovery code' : 'Create recovery code'}
            </Button>
          </Stack>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default AccountRecoverySection;
