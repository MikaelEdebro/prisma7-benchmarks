# Load test comparing Prisma 6 and Prisma 7, using Postgres

This repo performs loadtests against two apps. One is running Prisma 6, and the other one is running Prisma 7.

## Prerequisites

1. Make sure you have created one Postgres database for each app.
   They should be called `app_prisma6` & `app_prisma7` (if you use DATABASE_URL in .env)

2. Make sure you update the connection string in .env to use the correct credentials etc.

3. Have installed K6:  
   https://grafana.com/docs/k6/latest/set-up/install-k6/

4. Install dependencies & start apps

```bash
# 1. install dependencies (in both app folders)
npm run install

# 2. start both apps
npm start
```

## Run the tests

There are two tests:

```bash
# Only does reads. First it lists 100 posts, and then it fetches one by one
k6 ./.k6/read-heavy.js

# Write and read. First it creates a new post, then reads the details of that created post
k6 ./.k6/read-write.js
```

> Tip: Ask some AI agent to run the K6 test, and analyze the results!

## Test requirements

Since the connection pool behaviour is a bit different between Prisma 6 and Prisma 7, we need to make sure that number of connections are the same. We limit to 10 connections.

Tests are ran after one another, to avoid running in to resource issues related to CPU or memory.
