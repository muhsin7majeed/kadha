import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const adminUsersQuerySchema = z.object({
  query: z.string().optional().default(''),
  sort: z.enum(['username', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  role: z.nativeEnum(UserRole).optional(),
});
