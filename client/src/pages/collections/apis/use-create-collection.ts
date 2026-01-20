import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios-instance';
import { CollectionFormFields } from '../create';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { toaster } from '@/components/ui/toaster';

const createCollection = async (data: CollectionFormFields) => {
  const response = await api.post('/api/collection', data);
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
