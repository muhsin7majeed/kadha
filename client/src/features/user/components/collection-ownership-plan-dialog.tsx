import { Badge, Button, CloseButton, Dialog, Field, NativeSelect, Portal, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import {
  CollectionOwnershipOverride,
  DeletionImpact,
  OwnershipOverridesByCollection,
} from '@/features/user/account-deletion.types';
import { resolveDeletionPlan } from '@/features/user/account-deletion-plan';

interface CollectionOwnershipPlanDialogProps {
  automaticallyTransferEligibleCollections: boolean;
  impact: DeletionImpact;
  open: boolean;
  overrides: OwnershipOverridesByCollection;
  onClose: () => void;
  onSave: (overrides: OwnershipOverridesByCollection) => void;
}

const DEFAULT_VALUE = 'default';
const DELETE_VALUE = 'delete';
const transferValue = (userId: string) => `transfer:${userId}`;

const CollectionOwnershipPlanDialog = ({
  automaticallyTransferEligibleCollections,
  impact,
  open,
  overrides,
  onClose,
  onSave,
}: CollectionOwnershipPlanDialogProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [draftOverrides, setDraftOverrides] = useState<OwnershipOverridesByCollection>(overrides);

  useEffect(() => {
    if (open) setDraftOverrides(overrides);
  }, [open, overrides]);

  const resolved = resolveDeletionPlan(impact, automaticallyTransferEligibleCollections, draftOverrides);

  const setSelection = (collectionId: string, value: string) => {
    let override: CollectionOwnershipOverride | undefined;
    if (value === DELETE_VALUE) {
      override = { collectionId, action: 'delete' };
    } else if (value.startsWith('transfer:')) {
      override = { collectionId, action: 'transfer', newOwnerUserId: value.slice('transfer:'.length) };
    }

    setDraftOverrides((current) => ({ ...current, [collectionId]: override }));
  };

  return (
    <Dialog.Root
      open={open}
      initialFocusEl={() => headingRef.current}
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: 'calc(100vw - 2rem)', md: '2xl' }} maxH="calc(100vh - 2rem)">
            <Dialog.Header>
              <Dialog.Title ref={headingRef} tabIndex={-1} textStyle="sectionTitle">
                Review shared collections
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body overflowY="auto">
              <Stack gap="5">
                <Text textStyle="body" color="fg.muted">
                  An explicit choice remains in effect if you later change the automatic-transfer checkbox.
                </Text>

                {impact.sharedOwnedCollections.map((collection) => {
                  const override = draftOverrides[collection.id];
                  const outcome = resolved.outcomes.find((candidate) => candidate.collectionId === collection.id);
                  const automaticRecipient = collection.members.find(
                    (member) => member.userId === collection.automaticRecipientUserId,
                  );
                  const value =
                    override?.action === 'delete'
                      ? DELETE_VALUE
                      : override?.action === 'transfer'
                        ? transferValue(override.newOwnerUserId)
                        : DEFAULT_VALUE;

                  return (
                    <Stack key={collection.id} gap="3" borderWidth="1px" borderColor="border.subtle" rounded="lg" p="4">
                      <Stack gap="1">
                        <Text fontWeight="medium" textStyle="cardTitle">
                          {collection.name}
                        </Text>
                        <Text color="fg.muted" textStyle="supporting">
                          {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'} ·{' '}
                          {collection.members.length} {collection.members.length === 1 ? 'member' : 'members'}
                        </Text>
                        {automaticRecipient && (
                          <Text color="fg.muted" textStyle="supporting">
                            Automatic recipient: @{automaticRecipient.username}
                          </Text>
                        )}
                        <Badge
                          alignSelf="flex-start"
                          colorPalette={outcome?.action === 'transfer' ? 'green' : 'red'}
                          variant="surface"
                        >
                          {outcome?.action === 'transfer' ? 'Will be transferred' : 'Will be deleted'}
                          {outcome?.isOverride ? ' · Explicit choice' : ' · Current default'}
                        </Badge>
                      </Stack>

                      <Field.Root>
                        <Field.Label htmlFor={`new-owner-${collection.id}`}>New owner</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            id={`new-owner-${collection.id}`}
                            value={value}
                            onChange={(event) => setSelection(collection.id, event.target.value)}
                          >
                            <option value={DEFAULT_VALUE}>
                              Use current default (
                              {automaticallyTransferEligibleCollections ? 'automatic transfer' : 'delete'})
                            </option>
                            <option value={DELETE_VALUE}>Delete with my account</option>
                            {collection.members.map((member) => (
                              <option key={member.memberId} value={transferValue(member.userId)}>
                                @{member.username} — {member.role === 'editor' ? 'Editor' : 'Viewer'}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <Field.HelperText>
                          Choose a member or return this collection to the current default.
                        </Field.HelperText>
                        <Field.ErrorText />
                      </Field.Root>
                    </Stack>
                  );
                })}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button type="button" variant="outline" colorPalette="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" colorPalette="brand" onClick={() => onSave(draftOverrides)}>
                Save ownership plan
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CollectionOwnershipPlanDialog;
