import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { CollectionFormFields } from '../collection-menu/create-collection';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { toaster } from '@/components/ui/toaster';

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
  return useMutation({
    mutationFn: (payload: UpdateCollectionPayload) => updateCollection(payload),
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Collection updated successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export default useUpdateCollection;
