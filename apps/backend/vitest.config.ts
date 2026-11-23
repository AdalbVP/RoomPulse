import { defineConfig } from "vitest/config"
import { TEST_DATABASE_URL } from "./test/testDb"

export default defineConfig({
  test: {
    environment: "node",
    // Creates the test database (if needed) and applies the migrations before any test runs
    globalSetup: ["./test/globalSetup.ts"],
    setupFiles: ["./test/setup.ts"],
    // Set before any module loads, so config.ts (and Prisma) point to the TEST database
    env: {
      NODE_ENV: "test",
      DATABASE_URL: TEST_DATABASE_URL,
    },
    // All test files share one database, so they must not run at the same time
    fileParallelism: false,
    testTimeout: 15000,
  },
})
