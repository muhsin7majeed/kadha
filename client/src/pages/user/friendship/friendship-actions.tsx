import useAcceptFriendRequest from './apis/use-accept-friend-request';
import useSendFriendRequest from './apis/use-send-friend-request';
import useRejectFriendRequest from './apis/use-reject-friend-request';
import { FriendStatus } from '@/types/common';
import { Button, HStack } from '@chakra-ui/react';
import { LuCheck, LuClock, LuUserPlus, LuX } from 'react-icons/lu';

interface FriendshipActionsUser {
  id: string;
  friendshipStatus: FriendStatus;
  isRequestSender: boolean;
}

interface FriendshipActionsProps {
  user: FriendshipActionsUser;
  onSuccess?: () => void;
}

const FriendshipActions: React.FC<FriendshipActionsProps> = ({ user, onSuccess }) => {
  const { mutateAsync: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest();
  const { mutateAsync: acceptFriendRequest, isPending: isAcceptingFriendRequest } = useAcceptFriendRequest();
  const { mutateAsync: rejectFriendRequest, isPending: isRejectingFriendRequest } = useRejectFriendRequest();

  const handleSendFriendRequest = async (userId: string) => {
    if (isSendingFriendRequest) return;

    await sendFriendRequest(userId);

    onSuccess?.();
  };

  const handleAcceptFriendRequest = async (senderId: string) => {
    if (isAcceptingFriendRequest) return;

    await acceptFriendRequest(senderId);

    onSuccess?.();
  };

  const handleRejectFriendRequest = async (senderId: string) => {
    if (isRejectingFriendRequest) return;

    await rejectFriendRequest(senderId);

    onSuccess?.();
  };

  const renderFriendshipActions = (user: FriendshipActionsUser) => {
    const { friendshipStatus, isRequestSender } = user;

    // Already friends
    if (friendshipStatus === FriendStatus.Accepted) {
      return null;
    }

    // Current user sent a pending request
    if (friendshipStatus === FriendStatus.Pending && isRequestSender) {
      return (
        <Button variant="subtle" colorPalette="gray" size="sm" disabled>
          <LuClock />
          Request Sent
        </Button>
      );
    }

    // Other user sent a pending request - show Accept/Reject
    if (friendshipStatus === FriendStatus.Pending && !isRequestSender) {
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

    // No relationship - show Add Friend
    return (
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
    );
  };

  return <>{renderFriendshipActions(user)}</>;
};

export default FriendshipActions;
