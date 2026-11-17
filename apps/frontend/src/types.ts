export type TicketStatus = "PREPARING" | "LIGHT" | "TRAY" | "CART" | "COMPLETED"

// The statuses a ticket can be delivered with (what the backend accepts on /status)
export type DeliveryStatus = Extract<TicketStatus, "LIGHT" | "TRAY" | "CART">

export type Ticket = {
  id: string
  roomNumber: number
  status: TicketStatus
  createdAt: string
  deliveredAt: string | null
  completedAt: string | null
}
