import {
  Button,
  Card,
  CloseButton,
  Code,
  Dialog,
  Field,
  Heading,
  HStack,
  Input,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuDownload, LuTrash2, LuTriangleAlert } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui/toaster-store';
import { clearSession } from '@/features/auth/session';
import PasswordInput from '@/features/auth/components/password-input';
import useDeleteAccount from '@/features/user/api/use-delete-account';
import useExportUserData from '@/features/user/api/use-export-user-data';
import { DeleteAccountInputs } from '@/features/user/user.types';
import { getApiErrorMessage, getApiFieldError } from '@/hooks/use-error-handler';

export const DELETE_ACCOUNT_CONFIRMATION = 'I understand this account cannot be recovered';

interface DeleteAccountSectionProps {
  headingAs?: 'h2' | 'h3';
}

const DeleteAccountSection = ({ headingAs = 'h2' }: DeleteAccountSectionProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteAccount, error, isPending, reset: resetMutation } = useDeleteAccount();
  const { mutate: exportUserData, isPending: isExporting } = useExportUserData();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DeleteAccountInputs>({
    defaultValues: {
      currentPassword: '',
      confirmation: '',
    },
  });
  const confirmation = watch('confirmation');

  const closeDialog = () => {
    if (isPending) {
      return;
    }

    reset();
    resetMutation();
    setIsOpen(false);
  };

  const onSubmit: SubmitHandler<DeleteAccountInputs> = (payload) => {
    deleteAccount(payload, {
      onSuccess: async () => {
        reset();
        resetMutation();
        await clearSession();
        toaster.success({ title: 'Your account has been permanently deleted.' });
        navigate('/', { replace: true });
      },
    });
  };

  return (
    <Card.Root variant="outline" borderColor="border.error">
      <Card.Header>
        <HStack gap={2} color="fg.error">
          <LuTriangleAlert aria-hidden />
          <Heading as={headingAs} textStyle="subsectionTitle">
            Delete account
          </Heading>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          Permanently delete your account, saved media, activity, social connections, and collections you own.
        </Text>
      </Card.Header>

      <Card.Body>
        <Stack align={{ base: 'stretch', md: 'start' }} gap={4}>
          <Text textStyle="body">
            Collaborators will lose access to collections you own. Download an export first if you want to keep a copy
            of your data.
          </Text>
          <HStack gap={2} flexWrap="wrap">
            <Button
              type="button"
              variant="outline"
              colorPalette="gray"
              loading={isExporting}
              disabled={isExporting || isPending}
              onClick={() => exportUserData()}
            >
              <LuDownload />
              Export my data
            </Button>

            <Dialog.Root
              role="alertdialog"
              open={isOpen}
              onOpenChange={(event) => {
                if (event.open) {
                  reset();
                  resetMutation();
                  setIsOpen(true);
                } else {
                  closeDialog();
                }
              }}
            >
              <Dialog.Trigger asChild>
                <Button type="button" colorPalette="red" disabled={isExporting}>
                  <LuTrash2 />
                  Delete my account
                </Button>
              </Dialog.Trigger>

              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content maxW={{ base: 'calc(100vw - 2rem)', md: 'lg' }}>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                      <Dialog.Header>
                        <Dialog.Title textStyle="sectionTitle">Permanently delete your account?</Dialog.Title>
                      </Dialog.Header>

                      <Dialog.Body>
                        <Stack gap={4}>
                          <Text textStyle="body">
                            This cannot be undone. Your account cannot be recovered after deletion, even with your
                            recovery code.
                          </Text>

                          {getApiErrorMessage(error) && !getApiFieldError(error, 'currentPassword') && (
                            <Text role="alert" color="fg.error" textStyle="supporting">
                              {getApiErrorMessage(error)}
                            </Text>
                          )}

                          <Field.Root
                            invalid={Boolean(errors.currentPassword || getApiFieldError(error, 'currentPassword'))}
                            required
                          >
                            <Field.Label>Current password</Field.Label>
                            <PasswordInput
                              autoComplete="current-password"
                              autoCapitalize="none"
                              spellCheck={false}
                              disabled={isPending}
                              {...register('currentPassword', { required: 'Current password is required' })}
                            />
                            <Field.ErrorText>
                              {errors.currentPassword?.message || getApiFieldError(error, 'currentPassword')}
                            </Field.ErrorText>
                          </Field.Root>

                          <Field.Root invalid={Boolean(errors.confirmation)} required>
                            <Field.Label>Type the confirmation phrase</Field.Label>
                            <Text textStyle="supporting" color="fg.muted">
                              Enter <Code>{DELETE_ACCOUNT_CONFIRMATION}</Code> exactly as shown.
                            </Text>
                            <Input
                              autoComplete="off"
                              disabled={isPending}
                              {...register('confirmation', {
                                required: 'Confirmation is required',
                                validate: (value) =>
                                  value === DELETE_ACCOUNT_CONFIRMATION || 'The confirmation phrase does not match',
                              })}
                            />
                            <Field.ErrorText>{errors.confirmation?.message}</Field.ErrorText>
                          </Field.Root>
                        </Stack>
                      </Dialog.Body>

                      <Dialog.Footer>
                        <Button
                          type="button"
                          variant="outline"
                          colorPalette="gray"
                          disabled={isPending}
                          onClick={closeDialog}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          colorPalette="red"
                          loading={isPending}
                          disabled={isPending || confirmation !== DELETE_ACCOUNT_CONFIRMATION}
                        >
                          Permanently delete account
                        </Button>
                      </Dialog.Footer>
                    </form>

                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" disabled={isPending} />
                    </Dialog.CloseTrigger>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default DeleteAccountSection;
