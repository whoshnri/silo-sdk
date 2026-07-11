/**
 * Shared test setup — creates a Silo instance from env vars.
 * 
 * Before running tests, make sure:
 *   1. The server is running (`deno task dev` in /server)
 *   2. These env vars are set (or use an .env file):
 *      - SILO_URL
 *      - BUCKET_ID
 *      - BUCKET_KEY
 */

import { Silo } from "../mod.ts";

const url = process.env.SILO_URL;
const bucketId = process.env.BUCKET_ID;
const bucketKey = process.env.BUCKET_KEY;

if (!url || !bucketId || !bucketKey) {
  console.error("Missing env vars: SILO_URL, BUCKET_ID, BUCKET_KEY");
  process.exit(1);
}

export const cache = new Silo({ url, bucketId, bucketKey });

// Generates a unique key per test run to avoid collisions
export const testKey = (name: string) => `test:${name}:${Date.now()}`;
