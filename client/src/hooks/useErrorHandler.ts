import { toaster } from '@/components/ui/toaster';

export const useErrorHandler = (error: unknown) => {
  if (error instanceof Error) {
    toaster.error({
      title: error.message,
    });
  } else {
    toaster.error({
      title: 'An unexpected error occurred',
    });
  }
};
