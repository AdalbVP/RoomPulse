import { beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"
import { app } from "../src/app"
import { prisma } from "../src/lib/prisma"
import { getIO } from "../src/sockets/socket"

// Socket.IO is not started in tests. A spy replaces it so we can check
// which events the API would broadcast to the connected devices.
vi.mock("../src/sockets/socket", () => {
  const io = { emit: vi.fn() }
  return { getIO: () => io, initSocket: vi.fn() }
})

const emit = vi.mocked(getIO().emit)

const MISSING_ID = "11111111-1111-4111-8111-111111111111"

// Tickets created straight in the database, skipping the API
function createTicket(roomNumber = 101, createdAt = new Date()) {
  return prisma.serviceTicket.create({ data: { roomNumber, createdAt } })
}

const deliver = (id: string, status: string = "LIGHT") =>
  request(app).patch(`/tickets/${id}/status`).send({ status })

const complete = (id: string) => request(app).patch(`/tickets/${id}/complete`)

beforeEach(() => {
  emit.mockClear()
})

describe("POST /tickets", () => {
  it("creates a ticket in PREPARING and broadcasts it", async () => {
    const res = await request(app).post("/tickets").send({ roomNumber: 101 })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      roomNumber: 101,
      status: "PREPARING",
      deliveredAt: null,
      completedAt: null,
    })
    expect(await prisma.serviceTicket.count()).toBe(1)
    expect(emit).toHaveBeenCalledWith(
      "ticketCreated",
      expect.objectContaining({ id: res.body.id })
    )
  })

  it.each([
    ["missing", {}],
    ["text", { roomNumber: "abc" }],
    ["decimal", { roomNumber: 101.5 }],
    ["zero", { roomNumber: 0 }],
    ["too big", { roomNumber: 10000 }],
  ])("rejects an invalid roomNumber (%s)", async (_label, body) => {
    const res = await request(app).post("/tickets").send(body)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe("VALIDATION_ERROR")
    expect(await prisma.serviceTicket.count()).toBe(0)
    expect(emit).not.toHaveBeenCalled()
  })

  it("rejects a body that is not valid JSON", async () => {
    const res = await request(app)
      .post("/tickets")
      .set("Content-Type", "application/json")
      .send('{ "roomNumber": 101,')

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe("INVALID_JSON")
  })
})

describe("PATCH /tickets/:id/status (delivery)", () => {
  it("moves PREPARING -> LIGHT, sets deliveredAt and broadcasts", async () => {
    const ticket = await createTicket()

    const res = await deliver(ticket.id, "LIGHT")

    expect(res.status).toBe(200)
    expect(res.body.status).toBe("LIGHT")
    expect(res.body.deliveredAt).not.toBeNull()
    expect(emit).toHaveBeenCalledWith(
      "ticketUpdated",
      expect.objectContaining({ id: ticket.id, status: "LIGHT" })
    )
  })

  it.each(["COMPLETED", "PREPARING", "FLYING"])(
    "does not accept %s as a delivery status",
    async (status) => {
      const ticket = await createTicket()

      const res = await deliver(ticket.id, status)

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe("VALIDATION_ERROR")

      const saved = await prisma.serviceTicket.findUniqueOrThrow({ where: { id: ticket.id } })
      expect(saved.status).toBe("PREPARING")
    }
  )

  it("rejects changing the delivery type once it was delivered (409)", async () => {
    const ticket = await createTicket()
    await deliver(ticket.id, "LIGHT")
    emit.mockClear()

    const res = await deliver(ticket.id, "TRAY")

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe("CONFLICT")
    expect(emit).not.toHaveBeenCalled()

    const saved = await prisma.serviceTicket.findUniqueOrThrow({ where: { id: ticket.id } })
    expect(saved.status).toBe("LIGHT")
  })

  it("returns 404 for a ticket that does not exist", async () => {
    const res = await deliver(MISSING_ID)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("NOT_FOUND")
  })

  it("returns 400 when the id is not a UUID", async () => {
    const res = await deliver("not-a-uuid")

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe("VALIDATION_ERROR")
  })

  it("lets exactly one of many simultaneous requests win", async () => {
    const ticket = await createTicket()
    const statuses = ["LIGHT", "TRAY", "CART"]

    // Ten devices choose a delivery type for the same ticket at the same time
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => deliver(ticket.id, statuses[i % 3]))
    )

    const winners = results.filter((r) => r.status === 200)
    const rejected = results.filter((r) => r.status === 409)

    expect(winners).toHaveLength(1)
    expect(rejected).toHaveLength(9)

    // The database keeps the winner's choice, and only one event was broadcast
    const saved = await prisma.serviceTicket.findUniqueOrThrow({ where: { id: ticket.id } })
    expect(saved.status).toBe(winners[0].body.status)
    expect(emit).toHaveBeenCalledTimes(1)
  })
})

describe("PATCH /tickets/:id/complete", () => {
  it("rejects completing a ticket that was never delivered (409)", async () => {
    const ticket = await createTicket()

    const res = await complete(ticket.id)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe("CONFLICT")

    const saved = await prisma.serviceTicket.findUniqueOrThrow({ where: { id: ticket.id } })
    expect(saved.status).toBe("PREPARING")
    expect(saved.completedAt).toBeNull()
  })

  it("completes a delivered ticket, sets completedAt and broadcasts", async () => {
    const ticket = await createTicket()
    await deliver(ticket.id, "TRAY")
    emit.mockClear()

    const res = await complete(ticket.id)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe("COMPLETED")
    expect(res.body.completedAt).not.toBeNull()
    expect(emit).toHaveBeenCalledWith(
      "ticketCompleted",
      expect.objectContaining({ id: ticket.id })
    )
  })

  it("rejects completing twice and keeps the original completedAt", async () => {
    const ticket = await createTicket()
    await deliver(ticket.id)
    const first = await complete(ticket.id)

    const second = await complete(ticket.id)

    expect(second.status).toBe(409)

    const saved = await prisma.serviceTicket.findUniqueOrThrow({ where: { id: ticket.id } })
    expect(saved.completedAt?.toISOString()).toBe(first.body.completedAt)
  })

  it("rejects delivering a ticket that is already completed (409)", async () => {
    const ticket = await createTicket()
    await deliver(ticket.id)
    await complete(ticket.id)

    const res = await deliver(ticket.id, "CART")

    expect(res.status).toBe(409)
  })

  it("returns 404 for a ticket that does not exist", async () => {
    const res = await complete(MISSING_ID)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("NOT_FOUND")
  })
})

describe("GET /tickets/active", () => {
  it("lists only tickets that are not completed, oldest first", async () => {
    await createTicket(102, new Date("2026-01-01T10:05:00Z"))
    await createTicket(101, new Date("2026-01-01T10:00:00Z"))
    const done = await createTicket(103, new Date("2026-01-01T10:10:00Z"))
    await deliver(done.id)
    await complete(done.id)

    const res = await request(app).get("/tickets/active")

    expect(res.status).toBe(200)
    expect(res.body.map((t: { roomNumber: number }) => t.roomNumber)).toEqual([101, 102])
  })
})

describe("other routes", () => {
  it("GET /time returns the server time as an ISO date", async () => {
    const res = await request(app).get("/time")

    expect(res.status).toBe(200)
    expect(Math.abs(new Date(res.body.now).getTime() - Date.now())).toBeLessThan(5000)
  })

  it("answers unknown routes with a JSON 404", async () => {
    const res = await request(app).get("/nope")

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND")
  })
})
