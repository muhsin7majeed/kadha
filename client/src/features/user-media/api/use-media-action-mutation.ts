import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toaster } from '@/components/ui/toaster-store';
import { useErrorHandler as handleApiError } from '@/hooks/use-error-handler';
import api from '@/lib/axios-instance';
import { BaseInfoResponse } from '@/types/common';
import { MediaAction, UserMediaPayload } from '../user-media.types';
import { getMediaActionToast, getUndoMediaActionPayload } from '../utils/media-action-copy';
import {
  MediaActionCacheSnapshot,
  getMediaActionCacheSnapshot,
  invalidateMediaDiscoveryQueries,
  restoreMediaActionCacheSnapshot,
  updateMediaActionCache,
} from './update-media-action-cache';

interface MediaActionMutationContext {
  snapshot: MediaActionCacheSnapshot;
}

interface MediaActionToast {
  title: string;
  description?: string;
}

export interface MediaActionToastAction {
  label: string;
  onClick: () => void;
}

export interface MediaActionMutationBehavior {
  getToast?: (action: MediaAction, payload: UserMediaPayload) => MediaActionToast;
  getToastAction?: (payload: UserMediaPayload) => MediaActionToastAction | undefined;
}

interface UseMediaActionMutationOptions {
  action: MediaAction;
  endpoint: string;
  behavior?: MediaActionMutationBehavior;
}

const postMediaAction = async (endpoint: string, payload: UserMediaPayload) => {
  const response = await api.post<BaseInfoResponse>(endpoint, payload);
  return response.data;
};

const useMediaActionMutation = ({ action, endpoint, behavior }: UseMediaActionMutationOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<BaseInfoResponse, unknown, UserMediaPayload, MediaActionMutationContext>({
    mutationFn: (payload) => postMediaAction(endpoint, payload),
    onMutate: (payload) => {
      const snapshot = getMediaActionCacheSnapshot(queryClient);

      updateMediaActionCache(queryClient, action, payload);

      return { snapshot };
    },
    onError: (error, _payload, context) => {
      if (context) {
        restoreMediaActionCacheSnapshot(queryClient, context.snapshot);
      }

      handleApiError(error);
    },
    onSuccess: async (_data, payload) => {
      const toast = behavior?.getToast?.(action, payload) ?? getMediaActionToast(action, payload);
      const nextValue = payload[action];
      const customToastAction = behavior?.getToastAction?.(payload);

      toaster.success({
        ...toast,
        action: customToastAction
          ? customToastAction
          : nextValue
          ? undefined
          : {
              label: 'Undo',
              onClick: () => mutation.mutate(getUndoMediaActionPayload(action, payload)),
            },
      });

      await invalidateMediaDiscoveryQueries(queryClient);
    },
  });

  return mutation;
};

export default useMediaActionMutation;
