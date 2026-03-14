import "dotenv/config";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL environment variable is not set.");

const adapter = new PrismaPg({ 
  connectionString: databaseUrl,
  max: 1  // ← limit connections for Neon.tech free tier
});

const prisma = new PrismaClient({ adapter });

export default prisma;