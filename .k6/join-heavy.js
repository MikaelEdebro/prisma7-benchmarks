import { check } from "k6";
import http from "k6/http";
import { Trend, Counter } from "k6/metrics";

const VIRTUAL_USERS = 50;
const TEST_DURATION = "60s";

// Custom metrics for each Prisma version
const prisma6ListWithJoinDuration = new Trend(
  "prisma6_list_with_join_duration",
  true
);
const prisma6GetByIdWithJoinDuration = new Trend(
  "prisma6_get_by_id_with_join_duration",
  true
);
const prisma7ListWithJoinDuration = new Trend(
  "prisma7_list_with_join_duration",
  true
);
const prisma7GetByIdWithJoinDuration = new Trend(
  "prisma7_get_by_id_with_join_duration",
  true
);
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
    prisma6_list_with_join_duration: ["p(95)<2000"],
    prisma6_get_by_id_with_join_duration: ["p(95)<2000"],
    prisma7_list_with_join_duration: ["p(95)<2000"],
    prisma7_get_by_id_with_join_duration: ["p(95)<2000"],
    prisma6_errors: ["count<10"],
    prisma7_errors: ["count<10"],
  },
};

function listPostsWithComments(url, listMetric, errorCounter, versionTag) {
  const res = http.get(`${url}/posts-with-comments`, {
    headers: headers,
    tags: { version: versionTag, operation: "listWithJoin" },
  });

  listMetric.add(res.timings.duration);

  let postIds = [];
  const success = check(res, {
    "listWithJoin: status is 200": (r) => r.status === 200,
    "listWithJoin: no errors in response": (r) => {
      const body = r.json();
      return !body.errors || body.errors.length === 0;
    },
    "listWithJoin: has posts data": (r) => {
      const body = r.json();
      return body.length > 0;
    },
    "listWithJoin: posts have comments": (r) => {
      const body = r.json();
      return body[0] && body[0].comments && body[0].comments.length > 0;
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

function getPostByIdWithComments(
  url,
  postId,
  getMetric,
  errorCounter,
  totalReadsCounter,
  versionTag
) {
  const res = http.get(`${url}/posts-with-comments/${postId}`, {
    headers: headers,
    tags: { version: versionTag, operation: "getByIdWithJoin" },
  });

  getMetric.add(res.timings.duration);
  totalReadsCounter.add(1);

  const success = check(res, {
    "getByIdWithJoin: status is 200": (r) => r.status === 200,
    "getByIdWithJoin: no errors in response": (r) => {
      const body = r.json();
      return !body.errors || body.errors.length === 0;
    },
    "getByIdWithJoin: has post data": (r) => {
      const body = r.json();
      return body.id !== undefined;
    },
    "getByIdWithJoin: has comments": (r) => {
      const body = r.json();
      return body.comments && body.comments.length > 0;
    },
  });

  if (!success) {
    errorCounter.add(1);
  }
}

function runJoinHeavyTest(
  url,
  listMetric,
  getMetric,
  errorCounter,
  totalReadsCounter,
  versionTag
) {
  // Step 1: List all posts with comments (join query)
  const postIds = listPostsWithComments(
    url,
    listMetric,
    errorCounter,
    versionTag
  );
  totalReadsCounter.add(1); // Count the list operation as a read

  // Step 2: For each post, get the details with comments (join query)
  for (const postId of postIds) {
    getPostByIdWithComments(
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
  runJoinHeavyTest(
    PRISMA6_URL,
    prisma6ListWithJoinDuration,
    prisma6GetByIdWithJoinDuration,
    prisma6Errors,
    prisma6TotalReads,
    "prisma6"
  );
}

export function testPrisma7() {
  runJoinHeavyTest(
    PRISMA7_URL,
    prisma7ListWithJoinDuration,
    prisma7GetByIdWithJoinDuration,
    prisma7Errors,
    prisma7TotalReads,
    "prisma7"
  );
}
