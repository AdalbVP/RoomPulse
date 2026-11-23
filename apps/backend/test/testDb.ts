// Tests run against their own database so they can never touch your development data.
// Override with TEST_DATABASE_URL if your Postgres is not the one from docker-compose.yml
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:password@localhost:5432/roompulse_test"

export const TEST_DATABASE_NAME = new URL(TEST_DATABASE_URL).pathname.slice(1)

// Safety net: the tests delete every ticket, so the database name must say it is a test one
if (!/^[a-z0-9_]+_test$/.test(TEST_DATABASE_NAME)) {
  throw new Error(
    `Refusing to run tests: database "${TEST_DATABASE_NAME}" does not end with "_test"`
  )
}
