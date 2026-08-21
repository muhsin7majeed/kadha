import {
  Alert,
  Button,
  Card,
  Checkbox,
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
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LuDownload, LuTrash2, LuTriangleAlert } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui/toaster-store';
import PasswordInput from '@/features/auth/components/password-input';
import { clearSession } from '@/features/auth/session';
import {
  keepValidOwnershipOverrides,
  resolveDeletionPlan,
  toOwnershipPlan,
} from '@/features/user/account-deletion-plan';
import { OwnershipOverridesByCollection } from '@/features/user/account-deletion.types';
import useDeleteAccount from '@/features/user/api/use-delete-account';
import useDeletionImpact from '@/features/user/api/use-deletion-impact';
import useExportUserData from '@/features/user/api/use-export-user-data';
import CollectionOwnershipPlanDialog from '@/features/user/components/collection-ownership-plan-dialog';
import DeletionImpactSummary from '@/features/user/components/deletion-impact-summary';
import { getApiErrorCode, getApiErrorMessage, getApiFieldError } from '@/hooks/use-error-handler';

export const DELETE_ACCOUNT_CONFIRMATION = 'I understand this account cannot be recovered';

interface DeleteAccountSectionProps {
  headingAs?: 'h2' | 'h3';
}

interface ConfirmationInputs {
  currentPassword: string;
  confirmation: string;
}

const DeleteAccountSection = ({ headingAs = 'h2' }: DeleteAccountSectionProps) => {
  const navigate = useNavigate();
  const lastFingerprint = useRef<string | undefined>(undefined);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [automaticallyTransfer, setAutomaticallyTransfer] = useState(false);
  const [overrides, setOverrides] = useState<OwnershipOverridesByCollection>({});
  const [requiresImpactReview, setRequiresImpactReview] = useState(false);
  const deletionImpact = useDeletionImpact();
  const { mutate: deleteAccount, error, isPending, reset: resetMutation } = useDeleteAccount();
  const { mutate: exportUserData, isPending: isExporting } = useExportUserData();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ConfirmationInputs>({
    defaultValues: { currentPassword: '', confirmation: '' },
  });
  const confirmation = watch('confirmation');
  const impact = deletionImpact.data;
  const plan = impact ? resolveDeletionPlan(impact, automaticallyTransfer, overrides) : null;

  useEffect(() => {
    if (!impact) return;

    if (lastFingerprint.current && lastFingerprint.current !== impact.impactFingerprint) {
      setOverrides((current) => keepValidOwnershipOverrides(impact, current));
      setRequiresImpactReview(true);
      setIsConfirmationOpen(false);
      reset();
      resetMutation();
    }

    lastFingerprint.current = impact.impactFingerprint;
  }, [impact, reset, resetMutation]);

  const closeConfirmation = () => {
    if (isPending) return;
    reset();
    resetMutation();
    setIsConfirmationOpen(false);
  };

  const openConfirmation = async () => {
    const previousFingerprint = impact?.impactFingerprint;
    const refreshed = await deletionImpact.refetch();

    if (!refreshed.data || refreshed.isError) return;
    if (previousFingerprint && refreshed.data.impactFingerprint !== previousFingerprint) {
      setOverrides((current) => keepValidOwnershipOverrides(refreshed.data!, current));
      setRequiresImpactReview(true);
      return;
    }

    reset();
    resetMutation();
    setIsConfirmationOpen(true);
  };

  const onSubmit: SubmitHandler<ConfirmationInputs> = (values) => {
    if (!impact || requiresImpactReview) return;

    deleteAccount(
      {
        ...values,
        impactFingerprint: impact.impactFingerprint,
        ownershipPlan: toOwnershipPlan(automaticallyTransfer, overrides),
      },
      {
        onSuccess: async () => {
          reset();
          resetMutation();
          await clearSession();
          toaster.success({ title: 'Your account has been permanently deleted.' });
          navigate('/', { replace: true });
        },
        onError: async (mutationError) => {
          if (getApiErrorCode(mutationError) !== 'DELETION_IMPACT_CHANGED') return;

          reset();
          resetMutation();
          setIsConfirmationOpen(false);
          const refreshed = await deletionImpact.refetch();
          if (refreshed.data) {
            setOverrides((current) => keepValidOwnershipOverrides(refreshed.data!, current));
          }
          setRequiresImpactReview(true);
        },
      },
    );
  };

  const hasSharedCollections = Boolean(impact?.sharedOwnedCollections.length);

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
        <Stack align="stretch" gap={4}>
          <Text textStyle="body">
            Download an export first if you want to keep a copy of your data. Transferred collections and their items
            remain in Kadha under their new owner.
          </Text>

          {deletionImpact.isLoading ? (
            <Text role="status" color="fg.muted" textStyle="supporting">
              Loading deletion impact…
            </Text>
          ) : deletionImpact.isError || !impact || !plan ? (
            <Alert.Root status="error" role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Deletion impact could not be loaded</Alert.Title>
                <Alert.Description>Account deletion is unavailable until the impact can be reviewed.</Alert.Description>
              </Alert.Content>
              <Button size="sm" variant="outline" colorPalette="red" onClick={() => deletionImpact.refetch()}>
                Retry
              </Button>
            </Alert.Root>
          ) : (
            <Stack gap="4">
              <DeletionImpactSummary impact={impact} plan={plan} />

              {impact.isFinalAdministrator && (
                <Alert.Root status="warning" role="alert">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>This is the final administrator account</Alert.Title>
                    <Alert.Description>Promote another administrator before deleting this account.</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              {requiresImpactReview && (
                <Alert.Root status="warning" role="alert">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Your collaboration impact changed</Alert.Title>
                    <Alert.Description>
                      Review the updated outcome before trying account deletion again.
                    </Alert.Description>
                  </Alert.Content>
                  {!hasSharedCollections && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="gray"
                      onClick={() => setRequiresImpactReview(false)}
                    >
                      Review updated impact
                    </Button>
                  )}
                </Alert.Root>
              )}

              {hasSharedCollections && (
                <Checkbox.Root
                  checked={automaticallyTransfer}
                  onCheckedChange={(event) => setAutomaticallyTransfer(event.checked === true)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    <Stack gap="1">
                      <Text>Automatically transfer each shared collection to its earliest-added eligible member</Text>
                      <Text color="fg.muted" textStyle="supporting">
                        You can review or change the selected owner for each collection. Collections without an accepted
                        member will still be deleted.
                      </Text>
                    </Stack>
                  </Checkbox.Label>
                </Checkbox.Root>
              )}

              <HStack gap="2" flexWrap="wrap">
                {hasSharedCollections && (
                  <Button type="button" variant="outline" colorPalette="gray" onClick={() => setIsPlanOpen(true)}>
                    Review shared collections
                  </Button>
                )}
                <Button
                  type="button"
                  colorPalette="red"
                  disabled={
                    impact.isFinalAdministrator || requiresImpactReview || deletionImpact.isFetching || isExporting
                  }
                  onClick={openConfirmation}
                >
                  <LuTrash2 />
                  Delete my account
                </Button>
              </HStack>

              <CollectionOwnershipPlanDialog
                automaticallyTransferEligibleCollections={automaticallyTransfer}
                impact={impact}
                open={isPlanOpen}
                overrides={overrides}
                onClose={() => setIsPlanOpen(false)}
                onSave={(nextOverrides) => {
                  setOverrides(nextOverrides);
                  setRequiresImpactReview(false);
                  setIsPlanOpen(false);
                }}
              />

              <Dialog.Root
                role="alertdialog"
                open={isConfirmationOpen}
                onOpenChange={(event) => {
                  if (!event.open) closeConfirmation();
                }}
              >
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
                            <DeletionImpactSummary impact={impact} plan={plan} compact />
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
                              <Field.HelperText>
                                Enter <Code>{DELETE_ACCOUNT_CONFIRMATION}</Code> exactly as shown.
                              </Field.HelperText>
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
                            onClick={closeConfirmation}
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
            </Stack>
          )}

          <Button
            type="button"
            alignSelf={{ base: 'stretch', md: 'flex-start' }}
            variant="outline"
            colorPalette="gray"
            loading={isExporting}
            disabled={isExporting || isPending}
            onClick={() => exportUserData()}
          >
            <LuDownload />
            Export my data
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default DeleteAccountSection;
