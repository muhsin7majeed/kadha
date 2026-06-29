import { toaster } from '@/components/ui/toaster';
import { ApiErrorResponse, ApiFieldErrors } from '@/types/common';
import { isAxiosError } from 'axios';

export const getApiFieldErrors = (error: unknown): ApiFieldErrors | undefined => {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return undefined;
  }

  return error.response?.data.fieldErrors;
};

export const getApiFieldError = (error: unknown, field: string) => {
  const fieldErrors = getApiFieldErrors(error);

  if (!fieldErrors || Array.isArray(fieldErrors)) {
    return undefined;
  }

  return fieldErrors[field];
};

const getErrorMessage = (error: unknown) => {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return undefined;
  }

  return error.response?.data.message;
};

export const useErrorHandler = (error: unknown) => {
  const fieldErrors = getApiFieldErrors(error);

  if (fieldErrors) {
    const combinedErrors = Array.isArray(fieldErrors) ? fieldErrors : Object.values(fieldErrors).filter(Boolean);

    if (combinedErrors.length) {
      toaster.error({
        title: combinedErrors.join(', '),
      });

      return;
    }
  }

  const message = getErrorMessage(error);

  if (message) {
    toaster.error({
      title: message,
    });
  } else {
    toaster.error({
      title: 'An unexpected error occurred',
    });
  }
};
