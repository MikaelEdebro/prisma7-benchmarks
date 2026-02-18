# Prisma 7.4.0 Benchmark Results

Re-running benchmarks with Prisma 7.4.0 (vs Prisma 6.19.0).

## Environment

- **Prisma 6**: 6.19.0
- **Prisma 7**: 7.4.0
- **Database**: PostgreSQL (local)
- **Virtual Users**: 50 concurrent
- **Test Duration**: 60 seconds per version

## Results

### Read-Heavy (list + getById)

| Metric            | Prisma 6 | Prisma 7 | Difference     |
| ----------------- | -------- | -------- | -------------- |
| **GetById - avg** | 5.14ms   | 5.30ms   | +3% slower     |
| **GetById - p95** | 7.03ms   | 7.77ms   | +11% slower    |
| **List - avg**    | 7.01ms   | 7.55ms   | +8% slower     |
| **List - p95**    | 9.66ms   | 10.85ms  | +12% slower    |
| **Total Reads**   | 575,700  | 560,550  | -3% throughput |

### Write-and-Read (create + read)

| Metric             | Prisma 6 | Prisma 7 | Difference  |
| ------------------ | -------- | -------- | ----------- |
| **Create - avg**   | 8.16ms   | 8.13ms   | ~same       |
| **Create - p95**   | 13.29ms  | 16.00ms  | +20% slower |
| **Get - avg**      | 7.23ms   | 7.26ms   | ~same       |
| **Get - p95**      | 11.40ms  | 13.75ms  | +21% slower |

### Join-Heavy (list with includes)

| Metric                   | Prisma 6 | Prisma 7 | Difference  |
| ------------------------ | -------- | -------- | ----------- |
| **List with Join - avg** | 24.99ms  | 33.10ms  | +32% slower |
| **List with Join - p95** | 31.36ms  | 38.50ms  | +23% slower |

## Summary

Compared to the previous Prisma 7.0.1 benchmarks, **Prisma 7.4.0 shows significant improvement**:

| Operation          | 7.0.1 vs 6.19 | 7.4.0 vs 6.19 |
| ------------------ | ------------- | ------------- |
| Simple reads (avg) | 37-40% slower | 3-8% slower   |
| Write operations   | 26-27% slower | ~same (avg)   |
| Join queries       | 34-41% slower | 23-32% slower |

**Key observations:**
- Average latencies are now nearly identical for simple operations
- p95 latencies still show ~10-20% regression
- Join-heavy queries still show noticeable regression (~25-30%)
- Zero errors across all tests
