import { check } from "k6";
import http from "k6/http";
import { Trend, Counter } from "k6/metrics";

const VIRTUAL_USERS = 50;
const TEST_DURATION = "60s";

// Custom metrics for each Prisma version
const prisma6ListDuration = new Trend("prisma6_list_duration", true);
const prisma6GetByIdDuration = new Trend("prisma6_get_by_id_duration", true);
const prisma7ListDuration = new Trend("prisma7_list_duration", true);
const prisma7GetByIdDuration = new Trend("prisma7_get_by_id_duration", true);
const prisma6Errors = new Counter("prisma6_errors");
const prisma7Errors = new Counter("prisma7_errors");
const prisma6TotalReads = new Counter("prisma6_total_reads");
const prisma7TotalReads = new Counter("prisma7_total_reads");

// Configuration
const PRISMA6_URL = "http://localhost:8084";
const PRISMA7_URL = "http://localhost:8085";

const headers = {
  "Content-Type": "application/json",
};

export const options = {
  scenarios: {
    prisma6_test: {
      executor: "constant-vus",
      vus: VIRTUAL_USERS,
      duration: TEST_DURATION,
      exec: "testPrisma6",
      tags: { version: "prisma6" },
    },
    prisma7_test: {
      executor: "constant-vus",
      vus: VIRTUAL_USERS,
      duration: TEST_DURATION,
      exec: "testPrisma7",
      startTime: TEST_DURATION, // Start after prisma6 test completes
      tags: { version: "prisma7" },
    },
  },
  thresholds: {
    prisma6_list_duration: ["p(95)<2000"],
    prisma6_get_by_id_duration: ["p(95)<2000"],
    prisma7_list_duration: ["p(95)<2000"],
    prisma7_get_by_id_duration: ["p(95)<2000"],
    prisma6_errors: ["count<10"],
    prisma7_errors: ["count<10"],
  },
};

function listPosts(url, listMetric, errorCounter, versionTag) {
  const res = http.get(`${url}/posts`, {
    headers: headers,
    tags: { version: versionTag, operation: "list" },
  });

  listMetric.add(res.timings.duration);

  let postIds = [];
  const success = check(res, {
    "list: status is 200": (r) => r.status === 200,
    "list: no errors in response": (r) => {
      const body = r.json();
      return !body.errors || body.errors.length === 0;
    },
    "list: has posts data": (r) => {
      const body = r.json();
      return body.length > 0;
    },
  });

  if (!success) {
    errorCounter.add(1);
  } else {
    try {
      const body = res.json();
      postIds = body.map((post) => post.id);
    } catch (e) {
      // Ignore parsing errors
    }
  }

  return postIds;
}

function getPostById(
  url,
  postId,
  getMetric,
  errorCounter,
  totalReadsCounter,
  versionTag
) {
  const res = http.get(`${url}/posts/${postId}`, {
    headers: headers,
    tags: { version: versionTag, operation: "getById" },
  });

  getMetric.add(res.timings.duration);
  totalReadsCounter.add(1);

  const success = check(res, {
    "getById: status is 200": (r) => r.status === 200,
    "getById: no errors in response": (r) => {
      const body = r.json();
      return !body.errors || body.errors.length === 0;
    },
    "getById: has post data": (r) => {
      const body = r.json();
      return body.id !== undefined;
    },
  });

  if (!success) {
    errorCounter.add(1);
  }
}

function runReadHeavyTest(
  url,
  listMetric,
  getMetric,
  errorCounter,
  totalReadsCounter,
  versionTag
) {
  // Step 1: List all posts
  const postIds = listPosts(url, listMetric, errorCounter, versionTag);
  totalReadsCounter.add(1); // Count the list operation as a read

  // Step 2: For each post, get the details (read-heavy part)
  for (const postId of postIds) {
    getPostById(
      url,
      postId,
      getMetric,
      errorCounter,
      totalReadsCounter,
      versionTag
    );
  }
}

export function testPrisma6() {
  runReadHeavyTest(
    PRISMA6_URL,
    prisma6ListDuration,
    prisma6GetByIdDuration,
    prisma6Errors,
    prisma6TotalReads,
    "prisma6"
  );
}

export function testPrisma7() {
  runReadHeavyTest(
    PRISMA7_URL,
    prisma7ListDuration,
    prisma7GetByIdDuration,
    prisma7Errors,
    prisma7TotalReads,
    "prisma7"
  );
}
