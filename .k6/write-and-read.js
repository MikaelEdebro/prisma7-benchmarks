import { check } from "k6";
import http from "k6/http";
import { Trend, Counter } from "k6/metrics";

const VIRTUAL_USERS = 50;
const TEST_DURATION = "60s";

// Custom metrics for each Prisma version - separate for create and get operations
const prisma6CreateDuration = new Trend("prisma6_create_duration", true);
const prisma6GetDuration = new Trend("prisma6_get_duration", true);
const prisma7CreateDuration = new Trend("prisma7_create_duration", true);
const prisma7GetDuration = new Trend("prisma7_get_duration", true);
const prisma6Errors = new Counter("prisma6_errors");
const prisma7Errors = new Counter("prisma7_errors");

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
    prisma6_create_duration: ["p(95)<2000"],
    prisma6_get_duration: ["p(95)<2000"],
    prisma7_create_duration: ["p(95)<2000"],
    prisma7_get_duration: ["p(95)<2000"],
    prisma6_errors: ["count<10"],
    prisma7_errors: ["count<10"],
  },
};

function createPost(url, createMetric, errorCounter, versionTag) {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const payload = JSON.stringify({
    title: `Load Test Post ${uniqueId}`,
    body: `This is a test post created during k6 load testing for ${versionTag}. Timestamp: ${new Date().toISOString()}`,
  });

  const res = http.post(`${url}/posts`, payload, {
    headers: headers,
    tags: { version: versionTag, operation: "create" },
  });

  createMetric.add(res.timings.duration);

  let postId = null;
  const success = check(res, {
    "create: status is 200 or 201": (r) => r.status === 200 || r.status === 201,
    "create: no errors in response": (r) => {
      const body = r.json();
      return !body.errors;
    },
    "create: has post data": (r) => {
      const body = r.json();
      if (body.id) {
        postId = body.id;
        return true;
      }
      return false;
    },
  });

  if (!success) {
    errorCounter.add(1);
  }

  return postId;
}

function getPost(url, postId, getMetric, errorCounter, versionTag) {
  const res = http.get(`${url}/posts/${postId}`, {
    headers: headers,
    tags: { version: versionTag, operation: "get" },
  });

  getMetric.add(res.timings.duration);

  const success = check(res, {
    "get: status is 200": (r) => r.status === 200,
    "get: no errors in response": (r) => {
      const body = r.json();
      return !body.errors;
    },
    "get: has post data": (r) => {
      const body = r.json();
      return body.id === postId;
    },
  });

  if (!success) {
    errorCounter.add(1);
  }
}

function runTest(url, createMetric, getMetric, errorCounter, versionTag) {
  // Step 1: Create a post
  const postId = createPost(url, createMetric, errorCounter, versionTag);

  if (postId) {
    // Step 2: Get the created post
    getPost(url, postId, getMetric, errorCounter, versionTag);
  }
}

export function testPrisma6() {
  runTest(
    PRISMA6_URL,
    prisma6CreateDuration,
    prisma6GetDuration,
    prisma6Errors,
    "prisma6"
  );
}

export function testPrisma7() {
  runTest(
    PRISMA7_URL,
    prisma7CreateDuration,
    prisma7GetDuration,
    prisma7Errors,
    "prisma7"
  );
}
