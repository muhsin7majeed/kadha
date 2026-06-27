import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { CollectionFormFields } from '@/types/collections';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createCollection = async (payload: CollectionFormFields) => {
  const response = await api.post('/api/collection', payload);
  return response.data;
};

const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCollection,
    onError: useErrorHandler,
    onSuccess: () => {
      toaster.success({
        title: 'Collection created successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export default useCreateCollection;
