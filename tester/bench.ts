import { Silo } from "../mod.ts";

const url = Deno.env.get("SILO_URL") || "http://localhost:8000";
const bucketId = Deno.env.get("BUCKET_ID")?.trim();
const bucketKey = Deno.env.get("BUCKET_KEY")?.trim();

if (!bucketId || !bucketKey) {
  console.error("Missing BUCKET_ID or BUCKET_KEY env vars. Add them to .env to run benchmarks.");
  Deno.exit(1);
}

const cache = new Silo({ url, bucketId, bucketKey });

const NUM_KEYS = 1000;
const CONCURRENCY = 100;

async function runBatch(name: string, fn: (i: number) => Promise<void>) {
  const start = performance.now();
  const latencies: number[] = [];

  // Run in batches to respect concurrency limits
  for (let i = 0; i < NUM_KEYS; i += CONCURRENCY) {
    const batch = [];
    for (let j = 0; j < CONCURRENCY && i + j < NUM_KEYS; j++) {
      const idx = i + j;
      batch.push((async () => {
        const reqStart = performance.now();
        await fn(idx);
        latencies.push(performance.now() - reqStart);
      })());
    }
    await Promise.all(batch);
  }

  const end = performance.now();
  const totalMs = end - start;
  
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  
  const rps = (NUM_KEYS / (totalMs / 1000)).toFixed(2);
  
  console.log(`\n--- ${name} ---`);
  console.log(`Operations : ${NUM_KEYS}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Total Time : ${totalMs.toFixed(2)}ms`);
  console.log(`Throughput : ${rps} req/sec`);
  console.log(`Latencies  : p50: ${p50.toFixed(2)}ms | p95: ${p95.toFixed(2)}ms | p99: ${p99.toFixed(2)}ms`);
}

async function run() {
  console.log(`\n======================================`);
  console.log(`SILO SDK BENCHMARK`);
  console.log(`======================================`);
  console.log(`Target     : ${url}`);
  console.log(`Bucket ID  : ${bucketId}`);
  console.log(`======================================\n`);
  
  await runBatch("SET (Writes)", async (i) => {
    // Write 256 bytes string payload per request + a unique index
    await cache.set(`bench:${i}`, { data: "x".repeat(256), index: i }, 300);
  });
  
  await runBatch("GET (Reads)", async (i) => {
    await cache.get(`bench:${i}`);
  });
  
  await runBatch("DELETE (Deletions)", async (i) => {
    await cache.delete(`bench:${i}`);
  });

  console.log(`\nBenchmark complete.\n`);
}

run();
