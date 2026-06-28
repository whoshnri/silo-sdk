import { assertEquals, assertNotEquals } from "@std/assert";
import { cache, testKey } from "./setup.ts";

Deno.test("cache a large value (>64KB) with chunking", async () => {
  const key = testKey("large-value");
  
  // Create a 150KB string payload (exceeds the 64KB Deno KV limit)
  const data = "x".repeat(150 * 1024);
  const payload = { data };

  // Set
  const setResult = await cache.set(key, payload, 300);
  assertEquals(setResult.key, key);

  // Get
  const getResult = await cache.get<typeof payload>(key);
  assertNotEquals(getResult, null);
  assertEquals(getResult!.value.data.length, 150 * 1024);
  assertEquals(getResult!.value.data, data);

  // Delete
  await cache.delete(key);

  // Verify deletion
  const deletedResult = await cache.get(key);
  assertEquals(deletedResult, null);
});

Deno.test("cache multiple values concurrently via pooler", async () => {
  const concurrency = 50;
  const promises = [];
  const keys: string[] = [];

  for (let i = 0; i < concurrency; i++) {
    const key = testKey(`concurrent-pool-${i}`);
    keys.push(key);
    promises.push(cache.set(key, `val-${i}`, 300));
  }

  // Run set operations concurrently
  const setResults = await Promise.all(promises);
  assertEquals(setResults.length, concurrency);

  // Retrieve and verify each value
  const getPromises = keys.map(k => cache.get<string>(k));
  const getResults = await Promise.all(getPromises);
  
  for (let i = 0; i < concurrency; i++) {
    assertNotEquals(getResults[i], null);
    assertEquals(getResults[i]!.value, `val-${i}`);
  }

  // Cleanup
  const deletePromises = keys.map(k => cache.delete(k));
  await Promise.all(deletePromises);
});
