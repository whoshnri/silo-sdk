/**
 * Use case: Store different data types.
 * Verifies strings, numbers, arrays, nested objects, and booleans
 * all round-trip correctly through the cache.
 */

import { assertEquals, assertNotEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

Deno.test("cache a string value", async () => {
  const key = testKey("type-string");
  await cache.set(key, "hello world", 300);

  const result = await cache.get<string>(key);
  assertNotEquals(result, null);
  assertEquals(result!.value, "hello world");

  await cache.delete(key);
});

Deno.test("cache a number value", async () => {
  const key = testKey("type-number");
  await cache.set(key, 42, 300);

  const result = await cache.get<number>(key);
  assertNotEquals(result, null);
  assertEquals(result!.value, 42);

  await cache.delete(key);
});

Deno.test("cache an array value", async () => {
  const key = testKey("type-array");
  const arr = [1, "two", { three: 3 }];
  await cache.set(key, arr, 300);

  const result = await cache.get<typeof arr>(key);
  assertNotEquals(result, null);
  assertEquals(result!.value.length, 3);
  assertEquals(result!.value[1], "two");

  await cache.delete(key);
});

Deno.test("cache a nested object", async () => {
  const key = testKey("type-nested");
  const obj = { user: { name: "rhedawn", prefs: { theme: "dark" } } };
  await cache.set(key, obj, 300);

  const result = await cache.get<typeof obj>(key);
  assertNotEquals(result, null);
  assertEquals(result!.value.user.prefs.theme, "dark");

  await cache.delete(key);
});

Deno.test("cache a boolean value", async () => {
  const key = testKey("type-bool");
  await cache.set(key, true, 300);

  const result = await cache.get<boolean>(key);
  assertNotEquals(result, null);
  assertEquals(result!.value, true);

  await cache.delete(key);
});
