/**
 * Use case: Store a value and read it back.
 * The most basic flow — set a key, then get it and check the value matches.
 */

import { assertEquals, assertNotEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

Deno.test("set a value and get it back", async () => {
  const key = testKey("set-get");
  const payload = { username: "rhedawn", role: "admin" };

  const setResult = await cache.set(key, payload, 300);
  assertEquals(setResult.key, key);
  assertNotEquals(setResult.ttl, undefined);

  const getResult = await cache.get<typeof payload>(key);
  assertNotEquals(getResult, null);
  assertEquals(getResult!.value.username, "rhedawn");
  assertEquals(getResult!.value.role, "admin");
  assertEquals(typeof getResult!.expiresAt, "number");

  // cleanup
  await cache.delete(key);
});

Deno.test("set with default TTL when none is provided", async () => {
  const key = testKey("default-ttl");

  const result = await cache.set(key, "hello");
  // Server should apply DEFAULT_TTL_SECONDS (3600 by default)
  assertEquals(typeof result.ttl, "number");

  await cache.delete(key);
});
