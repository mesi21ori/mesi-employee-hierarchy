import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    url: "postgresql://postgres:1234567890@localhost:5432/employee-hierarchy"
  },
});
