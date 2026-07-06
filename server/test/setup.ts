import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach } from 'vitest';

const testDatabaseDirectory = mkdtempSync(join(tmpdir(), 'kadha-test-'));
const testDatabaseUrl = `file:${join(testDatabaseDirectory, 'test.db')}`;

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.TMDB_API_KEY = 'test-tmdb-api-key';
process.env.TMDB_BEARER_TOKEN = 'test-tmdb-bearer-token';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.APP_URL = 'http://localhost:3000';

let prisma: PrismaClient;

beforeAll(async () => {
  execFileSync('npx', ['prisma', 'db', 'push', '--force-reset'], {
    env: process.env,
    stdio: 'ignore',
  });

  const prismaModule = await import('@/lib/prisma');
  prisma = prismaModule.prisma;
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.collectionInvite.deleteMany(),
    prisma.collectionMember.deleteMany(),
    prisma.collectionItem.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.friendship.deleteMany(),
    prisma.userActivity.deleteMany(),
    prisma.userMedia.deleteMany(),
    prisma.mediaSnapshot.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
  rmSync(testDatabaseDirectory, { force: true, recursive: true });
});
