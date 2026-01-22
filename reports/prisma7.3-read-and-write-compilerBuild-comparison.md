## Write-and-Read Load Test Results - Comparing `compilerBuild` Settings

### Test Configuration

- **Test Duration**: 60 seconds per version
- **Virtual Users**: 50 concurrent users
- **Workload**: Mixed write and read operations (create + getById)
- **Sequential Execution**: Prisma 6 → Prisma 7

### Results Comparison

#### Test 1: Prisma 7 with `compilerBuild = "fast"` (previous test)

| Metric               | Prisma 6 | Prisma 7 (fast) | Difference        |
| -------------------- | -------- | --------------- | ----------------- |
| **Create - p95**     | 8.58ms   | 11.62ms         | +35.4% slower     |
| **Create - avg**     | 6.23ms   | 8.18ms          | +31.3% slower     |
| **Get - p95**        | 7.64ms   | 10.95ms         | +43.3% slower     |
| **Get - avg**        | 5.57ms   | 7.81ms          | +40.2% slower     |
| **Total Iterations** | ~250,894 | ~185,846        | -25.9% throughput |

#### Test 2: Prisma 7 with `compilerBuild = "small"` (current test)

| Metric               | Prisma 6 | Prisma 7 (small) | Difference        |
| -------------------- | -------- | ---------------- | ----------------- |
| **Create - p95**     | 8.31ms   | 11.61ms          | +39.7% slower     |
| **Create - avg**     | 6.16ms   | 8.75ms           | +42.0% slower     |
| **Get - p95**        | 7.54ms   | 11.1ms           | +47.2% slower     |
| **Get - avg**        | 5.55ms   | 8.46ms           | +52.4% slower     |
| **Total Iterations** | ~252,909 | ~172,830         | -31.7% throughput |

### `compilerBuild` Setting Impact on Prisma 7

| Metric               | Fast Build | Small Build | Change               |
| -------------------- | ---------- | ----------- | -------------------- |
| **Create - p95**     | 11.62ms    | 11.61ms     | ~0% (negligible)     |
| **Create - avg**     | 8.18ms     | 8.75ms      | +7.0% slower         |
| **Get - p95**        | 10.95ms    | 11.1ms      | +1.4% slower         |
| **Get - avg**        | 7.81ms     | 8.46ms      | +8.3% slower         |
| **Total Iterations** | ~185,846   | ~172,830    | **-7.0% throughput** |

### Summary

Switching from `compilerBuild = "fast"` to `compilerBuild = "small"` in Prisma 7:

- **Marginally slower** performance (~1-8% depending on metric)
- **7% reduction** in overall throughput
- **p95 latencies** remain relatively similar between the two builds
- Both builds still show **significant regression** vs Prisma 6 (31-47% slower, 26-32% less throughput)

The `compilerBuild` setting has minimal impact on performance. The main performance issue is between Prisma 6 and Prisma 7, not between Prisma 7's build configurations.
