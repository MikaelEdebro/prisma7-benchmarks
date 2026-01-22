## Read-Heavy Load Test Results (with `compilerBuild = "small"`)

### Test Configuration

- **Test Duration**: 60 seconds per version
- **Virtual Users**: 50 concurrent users
- **Workload**: Read-heavy operations (list + getById)
- **Sequential Execution**: Prisma 6 → Prisma 7
- **Prisma 7 Config**: `compilerBuild = "small"`

### Performance Comparison

| Metric            | Prisma 6 | Prisma 7 | Difference        |
| ----------------- | -------- | -------- | ----------------- |
| **GetById - p95** | 6.34ms   | 9.67ms   | +52.5% slower     |
| **GetById - avg** | 4.78ms   | 7.35ms   | +53.8% slower     |
| **List - p95**    | 8.43ms   | 12.05ms  | +42.9% slower     |
| **List - avg**    | 6.45ms   | 10.43ms  | +61.7% slower     |
| **Total Reads**   | 621,150  | 404,000  | -35.0% throughput |
| **Requests/sec**  | 5,170    | 3,362    | -35.0% throughput |
| **Errors**        | 0        | 0        | ✓                 |

### Threshold Status

All performance thresholds passed (p95 < 2000ms) ✓

- `prisma6_get_by_id_duration`: p(95)=6.34ms < 2000ms ✓
- `prisma6_list_duration`: p(95)=8.43ms < 2000ms ✓
- `prisma7_get_by_id_duration`: p(95)=9.67ms < 2000ms ✓
- `prisma7_list_duration`: p(95)=12.05ms < 2000ms ✓

### Comparison with Default Build (previous test)

| Metric            | Default | Small Build | Change              |
| ----------------- | ------- | ----------- | ------------------- |
| **GetById - p95** | 9.33ms  | 9.67ms      | +3.6% slower        |
| **List - p95**    | 13.91ms | 12.05ms     | **-13.4% faster** ✓ |
| **Requests/sec**  | 3,610   | 3,362       | -6.9% slower        |

### Summary

With `compilerBuild = "small"`, Prisma 7 shows:

- **Slight improvement in list operations** (~13% faster p95 vs default build)
- **Slight regression in getById operations** (~4% slower p95 vs default build)
- **Overall throughput reduction** of ~7% compared to default build
- **Still significantly slower than Prisma 6** across all metrics (43-62% slower, 35% less throughput)

The `compilerBuild = "small"` configuration provides marginal improvements to list queries but does not significantly close the performance gap with Prisma 6.
