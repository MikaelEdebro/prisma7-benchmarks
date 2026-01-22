## Read-Heavy Load Test Results (with `compilerBuild = "fast"`)

### Test Configuration

- **Test Duration**: 60 seconds per version
- **Virtual Users**: 50 concurrent users
- **Workload**: Read-heavy operations (list + getById)
- **Sequential Execution**: Prisma 6 → Prisma 7
- **Prisma 7 Config**: `compilerBuild = "fast"`

### Performance Comparison

| Metric            | Prisma 6 | Prisma 7 | Difference        |
| ----------------- | -------- | -------- | ----------------- |
| **GetById - p95** | 6.32ms   | 9.33ms   | +47.6% slower     |
| **GetById - avg** | 4.75ms   | 6.86ms   | +44.4% slower     |
| **List - p95**    | 8.17ms   | 13.91ms  | +70.3% slower     |
| **List - avg**    | 6.03ms   | 9.56ms   | +58.5% slower     |
| **Total Reads**   | 626,200  | 434,300  | -30.7% throughput |
| **Requests/sec**  | 5,206    | 3,610    | -30.7% throughput |
| **Errors**        | 0        | 0        | ✓                 |

### Threshold Status

All performance thresholds passed (p95 < 2000ms) ✓

- `prisma6_get_by_id_duration`: p(95)=6.32ms < 2000ms ✓
- `prisma6_list_duration`: p(95)=8.17ms < 2000ms ✓
- `prisma7_get_by_id_duration`: p(95)=9.33ms < 2000ms ✓
- `prisma7_list_duration`: p(95)=13.91ms < 2000ms ✓

### Summary

While both versions completed without errors and met the defined performance thresholds, **Prisma 7 shows measurable performance regression** compared to Prisma 6:

- **~44-58% slower** query execution times (avg)
- **~48-70% slower** at p95 latencies
- **~31% reduced** throughput under concurrent load

The regression is more pronounced in `list` operations than in `getById` operations.
