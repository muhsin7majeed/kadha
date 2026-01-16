import { toaster } from '@/components/ui/toaster';
import type { AxiosError } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useErrorHandler = (error: AxiosError<{ fieldErrors?: string[]; message?: string }> | any) => {
  if (Object.prototype.hasOwnProperty.call(error?.response?.data, 'fieldErrors')) {
    const combinedErrors: string[] = [];

    Object(error?.response?.data?.fieldErrors).forEach((error: string) => {
      combinedErrors.push(error);
    });

    toaster.error({
      title: combinedErrors.join(', '),
    });

    return;
  }

  if (error) {
    toaster.error({
      title: error.response?.data.message,
    });
  } else {
    toaster.error({
      title: 'An unexpected error occurred',
    });
  }
};
