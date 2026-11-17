import type { DeliveryStatus, Ticket } from "../types"

type Props = {
  ticket: Ticket
  now: number // current time in ms, already aligned with the server's clock
  updateStatus: (id: string, status: DeliveryStatus) => void
  completeTicket: (id: string) => void
}

function getHeaderColor(status: string) {
  switch (status) {
    case "LIGHT":
      return "#10B981"

    case "TRAY":
      return "#F59E0B"

    case "CART":
      return "#EF4444"

    default:
      return "#9CA3AF"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "LIGHT":
      return "LIGHT"

    case "TRAY":
      return "TRAY"

    case "CART":
      return "CART"

    default:
      return "PREPARING"
  }
}

function getElapsedTime(ticket: Ticket, now: number) {

  let startTime = ticket.createdAt

  if (ticket.deliveredAt) {
    startTime = ticket.deliveredAt
  }

  const start = new Date(startTime).getTime()

  const diff = Math.max(0, Math.floor((now - start) / 1000))

  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function getElapsedMinutes(ticket: Ticket, now: number) {

  let startTime = ticket.createdAt

  if (ticket.deliveredAt) {
    startTime = ticket.deliveredAt
  }

  const start = new Date(startTime).getTime()

  const diff = Math.max(0, Math.floor((now - start) / 1000))

  return Math.floor(diff / 60)
}

export default function TicketCard({ ticket, now, updateStatus, completeTicket }: Props) {

  const minutes = getElapsedMinutes(ticket, now)

  let borderColor = "#E5E7EB"

  if (minutes >= 20) borderColor = "#EF4444"
  else if (minutes >= 15) borderColor = "#F59E0B"

const canSelectDelivery =
  ticket.status === "PREPARING"

const canComplete =
  ticket.status === "LIGHT" ||
  ticket.status === "TRAY" ||
  ticket.status === "CART"

  const buttonStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  borderRadius: "10px",
  minWidth: "90px",
  fontWeight: "bold" as const,
  border: "1px solid #D1D5DB",
  backgroundColor: "#F3F4F6",
  color: "#374151",
  cursor: "pointer"
}

  let boxShadow = "0 4px 12px rgba(15,23,42,0.06)"
  let animation = "none"

  if (minutes >=15) {
    boxShadow = 
      "0 4px 12px rgba(15,23,42,0.06), 0 0 0 3px rgba(245,158,11,0.20)"
  }

  if (minutes >=20) {
    boxShadow = 
      "0 4px 12px rgba(15,23,42,0.06), 0 0 0 3px rgba(239,68,68,0.20)"
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",

        border: `1px solid ${borderColor}`,
        boxShadow,
        animation,
        transition: "all 0.5s ease",
        
        borderRadius: "16px",
        overflow: "hidden",

        width: "100%",
        boxSizing: "border-box"
      }}
    >

    <div
      style={{
        backgroundColor: getHeaderColor(ticket.status),
        color: "white",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "bold",
        textAlign: "left"
      }}
    >
      {getStatusLabel(ticket.status)}
    </div>

    <div
      style={{
      padding: "20px",
      color: "#1F2937",
      textAlign: "center"
      }}
    >

    <div
      style={{
      fontSize: "56px",
      fontWeight: "800",
      letterSpacing: "-1px"
      }}
    >
      {ticket.roomNumber}
    </div>

      <div 
        style={{
        fontSize: "14px",
        color: "#6B7280",
        marginTop: "8px"
        }}
      >
        {getElapsedTime(ticket, now)}
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >

        <button
          disabled={!canSelectDelivery}
          style={{ 
            ...buttonStyle,
            opacity: canSelectDelivery ? 1 : 0.4
          }}
          onClick={() => updateStatus(ticket.id, "LIGHT")}
        >
          LIGHT
        </button>

        <button
        disabled={!canSelectDelivery}
        style={{
          ...buttonStyle,
          opacity: canSelectDelivery ? 1 : 0.4
}}
        onClick={() => updateStatus(ticket.id, "TRAY")}
      >
        TRAY
      </button>

        <button
          disabled={!canSelectDelivery}
          style={{
            ...buttonStyle,
            opacity: canSelectDelivery ? 1 : 0.4
}}
          onClick={() => updateStatus(ticket.id, "CART")}
        >
          CART
        </button>

        <button
          disabled={!canComplete}
          style={{
            ...buttonStyle,
            opacity: canComplete ? 1 : 0.4,

            backgroundColor: "#3447AA",
            color: "white",
            border: "none",

            boxShadow: "0 4px 12px rgba(52,71,170,0.25)"
          }}
          onClick={() => completeTicket(ticket.id)}
        >
          DONE
        </button>

      </div>
    </div>
    </div>
  )
}