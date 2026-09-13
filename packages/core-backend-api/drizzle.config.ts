/// <reference types="node" />

import "dotenv/config";

import { env } from "node:process";
import { defineConfig } from "drizzle-kit";

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Environment variable "DATABASE_URL" is not defined');
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
