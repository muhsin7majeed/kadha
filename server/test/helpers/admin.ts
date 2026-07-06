import { UserRole } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { TestUser } from './auth';

export const promoteTestUserToAdmin = async (user: TestUser) => {
  await prisma.user.update({
    where: {
      id: user.userId,
    },
    data: {
      role: UserRole.ADMIN,
    },
  });
};
