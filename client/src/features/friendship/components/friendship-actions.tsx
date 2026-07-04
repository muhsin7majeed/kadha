import { useState } from 'react';
import { Button, HStack, IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuBan, LuCheck, LuClock, LuEllipsis, LuShieldOff, LuUserMinus, LuUserPlus, LuX } from 'react-icons/lu';

import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import useAcceptFriendRequest from '@/features/friendship/api/use-accept-friend-request';
import useBlock from '@/features/friendship/api/use-block';
import useRejectFriendRequest from '@/features/friendship/api/use-reject-friend-request';
import useSendFriendRequest from '@/features/friendship/api/use-send-friend-request';
import useUnblock from '@/features/friendship/api/use-unblock';
import useUnfriend from '@/features/friendship/api/use-unfriend';
import { FriendStatus } from '@/types/common';

interface FriendshipActionsUser {
  id: string;
  friendshipStatus: FriendStatus;
  isRequestSender: boolean;
}

interface FriendshipActionsProps {
  menuWithinDialog?: boolean;
  user: FriendshipActionsUser;
}

const FriendshipActions: React.FC<FriendshipActionsProps> = ({ menuWithinDialog = false, user }) => {
  const { mutateAsync: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest();
  const { mutateAsync: acceptFriendRequest, isPending: isAcceptingFriendRequest } = useAcceptFriendRequest();
  const { mutateAsync: rejectFriendRequest, isPending: isRejectingFriendRequest } = useRejectFriendRequest();
  const { mutateAsync: unfriend, isPending: isUnfriending } = useUnfriend();
  const { mutateAsync: block, isPending: isBlocking } = useBlock();
  const { mutateAsync: unblock, isPending: isUnblocking } = useUnblock();
  const [dialogAction, setDialogAction] = useState<'unfriend' | 'block' | null>(null);

  const handleSendFriendRequest = async (userId: string) => {
    if (isSendingFriendRequest) return;

    await sendFriendRequest(userId);
  };

  const handleAcceptFriendRequest = async (senderId: string) => {
    if (isAcceptingFriendRequest) return;

    await acceptFriendRequest(senderId);
  };

  const handleRejectFriendRequest = async (senderId: string) => {
    if (isRejectingFriendRequest) return;

    await rejectFriendRequest(senderId);
  };

  const handleUnfriend = async (userId: string) => {
    if (isUnfriending) return;

    await unfriend(userId);
    setDialogAction(null);
  };

  const handleBlock = async (userId: string) => {
    if (isBlocking) return;

    await block(userId);
    setDialogAction(null);
  };

  const handleUnblock = async (userId: string) => {
    if (isUnblocking) return;

    await unblock(userId);
  };

  const renderMenuPositioner = (children: React.ReactNode) => {
    if (menuWithinDialog) return children;

    return <Portal>{children}</Portal>;
  };

  const renderFriendshipActions = (user: FriendshipActionsUser) => {
    const { friendshipStatus } = user;

    if (friendshipStatus === FriendStatus.BlockedByMe) {
      return (
        <Button
          variant="subtle"
          colorPalette="blue"
          size="sm"
          loading={isUnblocking}
          onClick={() => {
            handleUnblock(user.id);
          }}
        >
          <LuShieldOff />
          Unblock
        </Button>
      );
    }

    if (friendshipStatus === FriendStatus.BlockedMe) {
      return null;
    }

    if (friendshipStatus === FriendStatus.Accepted) {
      return (
        <Menu.Root positioning={menuWithinDialog ? { strategy: 'fixed', hideWhenDetached: true } : undefined}>
          <Menu.Trigger asChild>
            <Button variant="subtle" colorPalette="gray" size="sm">
              Friends
              <LuEllipsis />
            </Button>
          </Menu.Trigger>

          {renderMenuPositioner(
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="unfriend" onClick={() => setDialogAction('unfriend')}>
                  <LuUserMinus />
                  Unfriend
                </Menu.Item>
                <Menu.Item value="block" color="fg.error" onClick={() => setDialogAction('block')}>
                  <LuBan />
                  Block user
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>,
          )}
        </Menu.Root>
      );
    }

    if (friendshipStatus === FriendStatus.PendingSent) {
      return (
        <Button variant="subtle" colorPalette="gray" size="sm" disabled>
          <LuClock />
          Request Sent
        </Button>
      );
    }

    if (friendshipStatus === FriendStatus.PendingReceived) {
      return (
        <HStack gap="2">
          <Button
            variant="subtle"
            colorPalette="green"
            size="sm"
            loading={isAcceptingFriendRequest}
            onClick={() => {
              handleAcceptFriendRequest(user.id);
            }}
          >
            <LuCheck />
            Accept
          </Button>

          <Button
            variant="subtle"
            colorPalette="red"
            size="sm"
            loading={isRejectingFriendRequest}
            onClick={() => {
              handleRejectFriendRequest(user.id);
            }}
          >
            <LuX />
            Reject
          </Button>
        </HStack>
      );
    }

    return (
      <HStack gap="2">
        <Button
          variant="subtle"
          colorPalette="blue"
          size="sm"
          loading={isSendingFriendRequest}
          onClick={() => {
            handleSendFriendRequest(user.id);
          }}
        >
          <LuUserPlus />
          Add Friend
        </Button>
        <Menu.Root positioning={menuWithinDialog ? { strategy: 'fixed', hideWhenDetached: true } : undefined}>
          <Menu.Trigger asChild>
            <IconButton variant="ghost" size="sm" aria-label="More user actions">
              <LuEllipsis />
            </IconButton>
          </Menu.Trigger>

          {renderMenuPositioner(
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="block" color="fg.error" onClick={() => setDialogAction('block')}>
                  <LuBan />
                  Block user
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>,
          )}
        </Menu.Root>
      </HStack>
    );
  };

  return (
    <>
      {renderFriendshipActions(user)}
      <ConfirmationDialog
        isOpen={dialogAction === 'unfriend'}
        title="Remove friend?"
        description="They will no longer be able to see friend-only activity."
        confirmButtonText="Unfriend"
        confirmButtonProps={{ colorPalette: 'red', loading: isUnfriending }}
        onOpenChange={(open) => {
          if (!open) setDialogAction(null);
        }}
        onConfirm={() => {
          handleUnfriend(user.id);
        }}
      />
      <ConfirmationDialog
        isOpen={dialogAction === 'block'}
        title="Block user?"
        description="They will not be able to find you, request you, or view your profile."
        confirmButtonText="Block"
        confirmButtonProps={{ colorPalette: 'red', loading: isBlocking }}
        onOpenChange={(open) => {
          if (!open) setDialogAction(null);
        }}
        onConfirm={() => {
          handleBlock(user.id);
        }}
      />
    </>
  );
};

export default FriendshipActions;
