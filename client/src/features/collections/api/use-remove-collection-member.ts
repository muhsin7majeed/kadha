import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RemoveCollectionMemberPayload {
  collectionId: string;
  memberId: string;
}

const removeCollectionMember = async ({ collectionId, memberId }: RemoveCollectionMemberPayload) => {
  return api.delete(`/api/collection/${collectionId}/members/${memberId}`);
};

const useRemoveCollectionMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCollectionMember,
    onError: useErrorHandler,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collectionById(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
};

export default useRemoveCollectionMember;
