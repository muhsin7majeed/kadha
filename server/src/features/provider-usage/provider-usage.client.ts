import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

import { isAppError } from '@/lib/http';
import { recordProviderRequest } from './provider-usage.service';

const getErrorStatus = (error: unknown) => {
  if (isAxiosError(error)) return error.response?.status;
  if (isAppError(error)) return error.statusCode;
  return undefined;
};

export const requestWithProviderMetrics = async <T>(
  provider: string,
  operation: string,
  request: () => Promise<AxiosResponse<T>>,
) => {
  const startedAt = Date.now();

  try {
    const response = await request();
    recordProviderRequest({
      provider,
      operation,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return response;
  } catch (error: unknown) {
    recordProviderRequest({
      provider,
      operation,
      status: getErrorStatus(error),
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
};
