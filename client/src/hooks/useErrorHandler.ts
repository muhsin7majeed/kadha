import { toaster } from '@/components/ui/toaster';

export const useErrorHandler = (error: any) => {
  if (Object(error?.response?.data).hasOwnProperty('fieldErrors')) {
    Object(error?.response?.data?.fieldErrors).forEach((error: string) => {
      toaster.error({
        title: error,
      });
    });

    return;
  }

  if (error) {
    toaster.error({
      title: error.response.data.message,
    });
  } else {
    toaster.error({
      title: 'An unexpected error occurred',
    });
  }
};
