import "dotenv/config";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const defaultFetch = globalThis.fetch.bind(globalThis);

neonConfig.fetchFunction = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await defaultFetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => {
          setTimeout(resolve, 200 * attempt);
        });
      }
    }
  }

  throw lastError;
};

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
