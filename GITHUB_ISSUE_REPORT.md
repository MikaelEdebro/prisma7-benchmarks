# Prisma 7 Performance Regression vs Prisma 6

## Summary

After upgrading from Prisma 6 to Prisma 7, we observed significant performance regressions across all database operations. Prisma 6 consistently outperforms Prisma 7 by **34-51%** depending on the operation type.

## Environment

- **OS**: macOS
- **Database**: PostgreSQL (local)
- **Connection pool**: 10 connections for both versions (controlled via `connection_limit` parameter)
- **Framework**: NestJS
- **Load testing tool**: K6
- **Virtual Users**: 50 concurrent users
- **Test Duration**: 60 seconds per version (sequential, Prisma 6 first, then Prisma 7)

### Versions

- **Prisma 6**: 6.19.0
- **Prisma 7**: 7.0.1

## Benchmark Results

### 1. Read-Heavy Benchmark

Simple read operations without joins (100 posts in database).

| Metric | Prisma 6 | Prisma 7 | Difference |
|--------|----------|----------|------------|
| **List Posts (avg)** | 6.14ms | 10.23ms | Prisma 6 is **40% faster** |
| **List Posts (p95)** | 8.78ms | 13.86ms | Prisma 6 is **37% faster** |
| **Get By ID (avg)** | 4.68ms | 7.39ms | Prisma 6 is **37% faster** |
| **Get By ID (p95)** | 6.36ms | 9.73ms | Prisma 6 is **35% faster** |
| **Total Reads** | 635,290 | 404,000 | Prisma 6 handled **57% more reads** |
| **Throughput** | 5,278/s | 3,356/s | Prisma 6 is **57% higher** |

### 2. Write-and-Read Benchmark

Create a post, then immediately read it back.

| Metric | Prisma 6 | Prisma 7 | Difference |
|--------|----------|----------|------------|
| **Create Post (avg)** | 6.48ms | 8.91ms | Prisma 6 is **27% faster** |
| **Create Post (p95)** | 9.16ms | 12.41ms | Prisma 6 is **26% faster** |
| **Get Post (avg)** | 5.67ms | 8.56ms | Prisma 6 is **34% faster** |
| **Get Post (p95)** | 8.10ms | 11.68ms | Prisma 6 is **31% faster** |

### 3. Join-Heavy Benchmark

Queries with `include` to fetch related data (100 posts, 1000 comments - 10 comments per post).

| Metric | Prisma 6 | Prisma 7 | Difference |
|--------|----------|----------|------------|
| **List with Join (avg)** | 29.56ms | 50.47ms | Prisma 6 is **41% faster** |
| **List with Join (p95)** | 63.06ms | 105.37ms | Prisma 6 is **40% faster** |
| **Get By ID with Join (avg)** | 9.86ms | 14.94ms | Prisma 6 is **34% faster** |
| **Get By ID with Join (p95)** | 14.41ms | 22.88ms | Prisma 6 is **37% faster** |
| **Total Reads** | 297,950 | 196,950 | Prisma 6 handled **51% more reads** |
| **Throughput** | 2,471/s | 1,633/s | Prisma 6 is **51% higher** |

## Overall Performance Summary

| Operation Type | Performance Difference |
|----------------|------------------------|
| Simple reads | 35-40% slower in Prisma 7 |
| Write operations | 26-27% slower in Prisma 7 |
| Join queries | 34-41% slower in Prisma 7 |
| Overall throughput | 51-57% lower in Prisma 7 |

## Key Observations

1. **Both versions had zero errors** - All tests completed successfully with 100% check pass rate
2. **Same connection pool size** - Both versions configured with 10 connections for fair comparison
3. **Consistent regression** - Performance gap is consistent across all operation types
4. **Higher impact on reads** - Read operations show the largest throughput difference

## Prisma Schema

```prisma
model Post {
  id         String    @id @default(uuid())
  title      String
  body       String    @db.Text
  createdAt  DateTime  @default(now()) @db.Timestamptz()
  modifiedAt DateTime  @default(now()) @db.Timestamptz()
  comments   Comment[]
}

model Comment {
  id         String   @id @default(uuid())
  content    String   @db.Text
  authorName String
  createdAt  DateTime @default(now()) @db.Timestamptz()
  post       Post     @relation(fields: [postId], references: [id])
  postId     String
}
```

## Reproduction

Repository: https://github.com/MikaelEdebro/prisma7-benchmarks

### Steps to reproduce

1. Clone the repository
2. Start PostgreSQL database
3. Install dependencies:
   ```bash
   cd app-prisma6 && npm install
   cd app-prisma7 && npm install
   ```
4. Run migrations and seed:
   ```bash
   cd app-prisma6 && npx prisma migrate reset --force
   cd app-prisma7 && npx prisma migrate reset --force && npx prisma db seed
   ```
5. Start both apps:
   ```bash
   npm run start-apps
   ```
6. Run benchmarks:
   ```bash
   k6 run ./.k6/read-heavy.js
   k6 run ./.k6/write-and-read.js
   k6 run ./.k6/join-heavy.js
   ```

## Expected Behavior

Prisma 7 should have similar or better performance compared to Prisma 6.

## Actual Behavior

Prisma 7 shows 26-57% performance regression across all tested operations.
