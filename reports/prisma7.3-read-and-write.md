## Write-and-Read Load Test Results (with `compilerBuild = "fast"`)

### Test Configuration

- **Test Duration**: 60 seconds per version
- **Virtual Users**: 50 concurrent users
- **Workload**: Mixed write and read operations (create + getById)
- **Sequential Execution**: Prisma 6 → Prisma 7
- **Prisma 7 Config**: `compilerBuild = "fast"`

### Performance Comparison

| Metric               | Prisma 6 | Prisma 7 | Difference        |
| -------------------- | -------- | -------- | ----------------- |
| **Create - p95**     | 8.58ms   | 11.62ms  | +35.4% slower     |
| **Create - avg**     | 6.23ms   | 8.18ms   | +31.3% slower     |
| **Get - p95**        | 7.64ms   | 10.95ms  | +43.3% slower     |
| **Get - avg**        | 5.57ms   | 7.81ms   | +40.2% slower     |
| **Total Iterations** | 250,894  | 185,846  | -25.9% throughput |
| **Iterations/sec**   | ~4,181   | ~3,097   | -25.9% throughput |
| **Errors**           | 0        | 0        | ✓                 |

### Threshold Status

All performance thresholds passed (p95 < 2000ms) ✓

- `prisma6_create_duration`: p(95)=8.58ms < 2000ms ✓
- `prisma6_get_duration`: p(95)=7.64ms < 2000ms ✓
- `prisma7_create_duration`: p(95)=11.62ms < 2000ms ✓
- `prisma7_get_duration`: p(95)=10.95ms < 2000ms ✓

### HTTP Request Overview

- **Total HTTP Requests**: 873,480 (2 requests per iteration)
- **Request Rate**: 7,277 req/s
- **Overall p95 Latency**: 10.03ms
- **HTTP Failures**: 0 (0.00%)

### Summary

In the write-and-read workload, Prisma 7 shows consistent performance regression compared to Prisma 6:

- **~31-35% slower** create operations
- **~40-43% slower** read operations
- **~26% reduced** throughput under concurrent mixed workload
- Both versions completed without errors

The performance gap is slightly larger for read operations than write operations in this mixed workload scenario.

---

**Note**: The test generated warnings about high-cardinality metrics (unique IDs in URLs), which affected memory usage but did not impact the validity of the performance measurements.
