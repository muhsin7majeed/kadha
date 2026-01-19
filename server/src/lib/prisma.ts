import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const basePrisma = new PrismaClient({ adapter });

const parseGenreIds = (genre_ids: string | null | undefined) => {
  return genre_ids ? JSON.parse(genre_ids) : null;
};

const prisma = basePrisma.$extends({
  query: {
    userMedia: {
      async findMany({ args, query }) {
        const result = await query(args);
        return result.map((item) => ({
          ...item,
          genre_ids: parseGenreIds(item.genre_ids),
        }));
      },
      async findFirst({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return {
          ...result,
          genre_ids: parseGenreIds(result.genre_ids),
        };
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (!result) return result;
        return {
          ...result,
          genre_ids: parseGenreIds(result.genre_ids),
        };
      },
    },
  },
});

export { prisma };
