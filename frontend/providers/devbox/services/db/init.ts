import { PrismaClient } from 'prisma/generated/client';

const createPrismaClient = () =>
  new PrismaClient({
    // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    // datasources: {
    //   db: {
    //     url: process.env.DATABASE_URL
    //   }
    // }
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const devboxDB = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = devboxDB;
}
