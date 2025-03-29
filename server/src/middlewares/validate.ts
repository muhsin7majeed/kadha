import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      /**
       * Doing all this because zod returns a lot of nested errors
       * and I want to return a flat array of errors for frontend to handle
       *
       * Example:
       * {
       *  username: ["Username is required"],
       *  password: ["Password is required", "Password must be at least 6 characters long"]
       * }
       *
       * This will be returned to frontend as:
       * {
       *  fieldErrors: ["Username is required", "Password is required", "Password must be at least 6 characters long"]
       * }
       */

      const formattedErrors: any = result.error.format();
      const errorMessages: string[] = [];

      for (const key in formattedErrors) {
        if (key !== "_errors") {
          const fieldErrors = formattedErrors[key]?._errors;

          if (fieldErrors) {
            errorMessages.push(...fieldErrors);
          }
        }
      }

      // If no field-specific errors, check for general form errors
      if (formattedErrors._errors?.length) {
        errorMessages.push(...formattedErrors._errors);
      }

      return res.status(400).json({ fieldErrors: errorMessages });
    }

    next();
  };
