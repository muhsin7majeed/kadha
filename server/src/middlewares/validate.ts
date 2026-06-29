import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';
import { badRequest, FieldErrors } from '@/lib/http';

type RequestSource = 'body' | 'query' | 'params';

const getFieldErrors = (schema: ZodSchema<unknown>, value: unknown) => {
  const result = schema.safeParse(value);

  if (result.success) {
    return null;
  }

  const fieldErrors: FieldErrors = {};
  const formErrors: string[] = [];

  result.error.issues.forEach((issue: ZodIssue) => {
    const field = issue.path[0];

    if (typeof field === 'string' || typeof field === 'number') {
      fieldErrors[String(field)] = issue.message;
      return;
    }

    formErrors.push(issue.message);
  });

  return {
    fieldErrors,
    formErrors,
  };
};

export const validate =
  (schema: ZodSchema<unknown>, source: RequestSource = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const errors = getFieldErrors(schema, req[source]);

    if (!errors) {
      return next();
    }

    if (Object.keys(errors.fieldErrors).length > 0) {
      return next(badRequest('Validation failed', errors.fieldErrors));
    }

    return next(badRequest(errors.formErrors[0] ?? 'Validation failed'));
  };
