import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined. Add it to your .env file."
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});