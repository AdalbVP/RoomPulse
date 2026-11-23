import { afterAll, beforeEach } from "vitest"
import { prisma } from "../src/lib/prisma"

// Last line of defense: never delete data from a database that is not a test one
if (!/_test$/.test(new URL(process.env.DATABASE_URL ?? "postgresql://x/none").pathname)) {
  throw new Error("DATABASE_URL does not point to a *_test database. Aborting.")
}

// Every test starts with an empty table
beforeEach(async () => {
  await prisma.serviceTicket.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
