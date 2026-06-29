import { UserRole } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const getUsernameArg = (args: string[]) => {
  const usernameFlagIndex = args.indexOf('--username');

  if (usernameFlagIndex === -1) {
    return null;
  }

  return args[usernameFlagIndex + 1]?.trim() || null;
};

const printUsage = () => {
  console.error('Usage: npm run admin:promote -- --username <username>');
};

async function main() {
  const username = getUsernameArg(process.argv.slice(2));

  if (!username) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  if (!user) {
    console.error(`User not found: ${username}`);
    process.exitCode = 1;
    return;
  }

  if (user.role === UserRole.ADMIN) {
    console.log(`${user.username} is already an admin.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: UserRole.ADMIN,
    },
    select: {
      id: true,
    },
  });

  console.log(`Promoted ${user.username} to admin.`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to promote admin: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
