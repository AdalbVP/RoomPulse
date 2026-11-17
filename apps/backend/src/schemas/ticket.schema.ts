import { z } from "zod"
import { ServiceStatus } from "@prisma/client"

export const ROOM_NUMBER_MIN = 1
export const ROOM_NUMBER_MAX = 9999

// /status only chooses HOW a ticket is delivered.
// PREPARING (initial state) and COMPLETED (set by /complete) are not valid targets here.
const deliveryStatuses = [
  ServiceStatus.LIGHT,
  ServiceStatus.TRAY,
  ServiceStatus.CART,
] as const

export const createTicketSchema = z.object({
  roomNumber: z
    .number()
    .int("roomNumber must be a whole number")
    .min(ROOM_NUMBER_MIN, `roomNumber must be at least ${ROOM_NUMBER_MIN}`)
    .max(ROOM_NUMBER_MAX, `roomNumber must be at most ${ROOM_NUMBER_MAX}`),
})

export const ticketIdParamsSchema = z.object({
  id: z.uuid("id must be a valid UUID"),
})

export const updateStatusSchema = z.object({
  status: z.enum(deliveryStatuses),
})
