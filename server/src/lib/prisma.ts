import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in your .env file");
}

// 1. Create the PostgreSQL connection pool
const pool = new pg.Pool({ connectionString });

// 2. Wrap it in the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma with the adapter
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // This tells Prisma 7 how to talk to the DB
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
