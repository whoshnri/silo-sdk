# @whoshnri/silo

A lightweight, high-performance Node.js & Deno client and CLI for the **Silo** self-hosted key-value cache.

## Installation

### Node.js (npm / yarn / pnpm)

```bash
npm install @whoshnri/silo
```

### Deno

Import directly from JSR:

```typescript
import { Silo } from "jsr:@whoshnri/silo";
```

---

## Features

- ⚡ **High Throughput**: Works seamlessly with Silo server's write pooler, allowing high-performance batch commits.
- 📦 **Automatic Value Chunking**: Bypasses the Deno KV 64KB single-key storage limit. Any payload larger than 60KB is automatically split into chunks and transparently reconstructed during retrieve (`GET`) and clean-up (`DELETE`) operations.
- 🛠️ **Fully Typed**: Written in TypeScript with complete auto-generated type definitions.

---

## Usage

### 1. Initialize Silo Client

Initialize the client with your Silo server URL, bucket ID, and bucket access key:

```typescript
import { Silo } from "@whoshnri/silo"; // or "jsr:@whoshnri/silo" on Deno

const cache = new Silo({
  url: "http://localhost:8000",
  bucketId: "your-bucket-uuid",
  bucketKey: "silo_bucket_yourkey...",
});
```

### 2. Basic KV Operations

#### Set a Cached Value

Store any JSON-serializable value (strings, numbers, booleans, arrays, nested objects) with an optional TTL (Time-To-Live) in seconds:

```typescript
// Cache user preferences for 5 minutes (300 seconds)
await cache.set("user:123:prefs", {
  theme: "dark",
  notifications: true,
  roles: ["admin", "editor"]
}, 300);
```

#### Get a Cached Value

Retrieve a cached value by key. Specify the generic type to get structured, typed return data:

```typescript
interface UserPrefs {
  theme: string;
  notifications: boolean;
  roles: string[];
}

const result = await cache.get<UserPrefs>("user:123:prefs");

if (result) {
  console.log(result.value.theme); // "dark"
  console.log(new Date(result.expiresAt)); // Expiry timestamp
} else {
  console.log("Key not found or expired.");
}
```

#### Delete a Cached Value

Manually remove a value from the cache:

```typescript
await cache.delete("user:123:prefs");
```

---

## Error Handling

Standard fetch or server-side errors will throw native JavaScript errors:

```typescript
try {
  await cache.set("key", value);
} catch (err) {
  console.error("Cache operation failed:", (err as Error).message);
}
```

## License

MIT
