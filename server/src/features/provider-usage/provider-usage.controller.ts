import { Request, Response } from 'express';

import { badRequest, sendResponse } from '@/lib/http';
import { flushProviderUsageMetrics, getProviderUsageReport } from './provider-usage.service';
import { getProviderUsageQuery, providerUsageQuerySchema } from './provider-usage.schema';

export const getUsage = async (req: Request, res: Response) => {
  const parsedQuery = providerUsageQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    throw badRequest('Validation failed');
  }

  await flushProviderUsageMetrics();
  const data = await getProviderUsageReport(getProviderUsageQuery(parsedQuery.data));

  sendResponse(res, { data });
};
