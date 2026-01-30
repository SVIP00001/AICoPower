import type { Config } from "drizzle-kit";

export default {
  schema: "./src/storage/database/shared/schema.ts",
  out: "./src/storage/database/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.PGDATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
