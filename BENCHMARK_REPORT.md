# Prisma 6 vs Prisma 7 Performance Benchmark Report

## Test Environment

- **OS**: macOS
- **Database**: PostgreSQL (local)
- **Connection pool**: 10 connections for both versions
- **Virtual Users**: 50 concurrent users
- **Test Duration**: 60 seconds per version (sequential)
- **Framework**: NestJS with K6 load testing

---

## Read-Heavy Benchmark Results

| Metric | Prisma 6 | Prisma 7 | Difference |
|--------|----------|----------|------------|
| **List Posts (avg)** | 6.14ms | 10.23ms | Prisma 6 is **40% faster** |
| **List Posts (p95)** | 8.78ms | 13.86ms | Prisma 6 is **37% faster** |
| **Get By ID (avg)** | 4.68ms | 7.39ms | Prisma 6 is **37% faster** |
| **Get By ID (p95)** | 6.36ms | 9.73ms | Prisma 6 is **35% faster** |
| **Total Reads** | 635,290 | 404,000 | Prisma 6 handled **57% more reads** |
| **Reads/second** | 5,278/s | 3,356/s | Prisma 6 is **57% higher throughput** |

---

## Write-and-Read Benchmark Results

| Metric | Prisma 6 | Prisma 7 | Difference |
|--------|----------|----------|------------|
| **Create Post (avg)** | 6.48ms | 8.91ms | Prisma 6 is **27% faster** |
| **Create Post (p95)** | 9.16ms | 12.41ms | Prisma 6 is **26% faster** |
| **Get Post (avg)** | 5.67ms | 8.56ms | Prisma 6 is **34% faster** |
| **Get Post (p95)** | 8.10ms | 11.68ms | Prisma 6 is **31% faster** |
| **Total Iterations** | ~207,000 | ~207,000 | Similar throughput |

---

## Summary

**Prisma 6 consistently outperforms Prisma 7** across all operations:

| Operation Type | Performance Difference |
|----------------|------------------------|
| Read operations | 35-40% faster |
| Write operations | 26-27% faster |
| Overall throughput (reads) | 57% higher |

### Key Observations

1. **Both versions had zero errors** and passed all thresholds
2. **Same connection pool size** (10 connections) for fair comparison
3. **Significant regression in Prisma 7** for both read and write workloads
4. The performance gap is more pronounced under heavy read loads

---

## Reproduction

Repository: https://github.com/MikaelEdebro/prisma7-benchmarks

### Steps to reproduce

1. Clone the repository
2. Start PostgreSQL database
3. Run `npm install` in both `app-prisma6` and `app-prisma7`
4. Run migrations in both apps
5. Seed the database with test data
6. Start both apps: `npm run start-apps`
7. Run benchmarks:
   - `k6 run ./.k6/read-heavy.js`
   - `k6 run ./.k6/write-and-read.js`

---

## Versions Tested

- **Prisma 6**: 6.x (see `app-prisma6/package.json`)
- **Prisma 7**: 7.x (see `app-prisma7/package.json`)
