import { execSync } from "node:child_process"
import path from "node:path"
import { Client } from "pg"
import { TEST_DATABASE_NAME, TEST_DATABASE_URL } from "./testDb"

// Runs once before all the tests
export default async function setup() {
  // 1. Create the test database if it does not exist yet
  const adminUrl = new URL(TEST_DATABASE_URL)
  adminUrl.pathname = "/postgres"

  const admin = new Client({ connectionString: adminUrl.toString() })
  await admin.connect()

  try {
    const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      TEST_DATABASE_NAME,
    ])

    if (exists.rowCount === 0) {
      // The name was validated in testDb.ts (lowercase letters, digits and underscores only)
      await admin.query(`CREATE DATABASE "${TEST_DATABASE_NAME}"`)
    }
  } finally {
    await admin.end()
  }

  // 2. Apply the migrations to it (does nothing if they are already applied)
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  })
}
