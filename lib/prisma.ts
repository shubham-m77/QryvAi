import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
    var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient.");
}

export const db: PrismaClient = globalThis.prisma || new PrismaClient({
    log: [process.env.NODE_ENV === 'development' ? 'query' : 'error'],
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

