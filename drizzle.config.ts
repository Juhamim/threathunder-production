import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local so drizzle-kit CLI can read DATABASE_URL
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
