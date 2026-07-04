import { toaster } from '@/components/ui/toaster';
import { useErrorHandler } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { CollectionFormFields } from '@/features/collections/collections.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateCollections } from './invalidate-collection-queries';

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

      invalidateCollections(queryClient);
    },
  });
};

export default useCreateCollection;
