import { z } from 'zod';

const optionalDate = z.coerce.date().optional();

export const providerUsageQuerySchema = z
  .object({
    from: optionalDate,
    to: optionalDate,
    provider: z.string().trim().min(1).max(50).optional(),
    operation: z.string().trim().min(1).max(100).optional(),
  })
  .superRefine((query, context) => {
    const to = query.to ?? new Date();
    const from = query.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (from >= to) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'The from date must be before the to date' });
    }

    if (to.getTime() - from.getTime() > 90 * 24 * 60 * 60 * 1000) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'The requested range cannot exceed 90 days' });
    }
  });

export const getProviderUsageQuery = (query: z.infer<typeof providerUsageQuerySchema>) => {
  const to = query.to ?? new Date();
  const from = query.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  return { from, to, provider: query.provider, operation: query.operation };
};
