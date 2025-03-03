import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../drizzle/schema.js";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/employee-hierarchy";

const client = postgres(connectionString, {
  max: 10, 
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(client, { schema });
