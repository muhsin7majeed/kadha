import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { CollectionFormFields } from '@/features/collections/collections.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateCollections } from './invalidate-collection-queries';

interface UpdateCollectionPayload extends CollectionFormFields {
  id: string;
}

const updateCollection = async (payload: UpdateCollectionPayload) => {
  const { id, ...payloadWithoutId } = payload;

  const response = await api.put(`/api/collection/${id}`, payloadWithoutId);
  return response.data;
};

const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, UpdateCollectionPayload>({
    mutationFn: (payload: UpdateCollectionPayload) => updateCollection(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Collection updated successfully',
      });

      invalidateCollections(queryClient);
    },
  });
};

export default useUpdateCollection;
