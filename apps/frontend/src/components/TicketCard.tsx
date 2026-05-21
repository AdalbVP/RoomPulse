type Ticket = {
  id: string
  roomNumber: number
  status: string
  createdAt: string
  deliveredAt: string | null
  completedAt: string | null
}

type Props = {
  ticket: Ticket
  updateStatus: (id: string, status: string) => void
  completeTicket: (id: string) => void
}

function getColor(status: string) {
  switch (status) {
    case "LIGHT":
      return "#4CAF50"
    case "TRAY":
      return "#FFC107"
    case "CART":
      return "#F44336"
    default:
      return "#9E9E9E"
  }
}

function getElapsedTime(ticket: Ticket) {

  let startTime = ticket.createdAt

  if (ticket.deliveredAt) {
    startTime = ticket.deliveredAt
  }

  const start = new Date(startTime).getTime()
  const now = new Date().getTime()

  const diff = Math.floor((now - start) / 1000)

  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function getElapsedMinutes(ticket: Ticket) {

  let startTime = ticket.createdAt

  if (ticket.deliveredAt) {
    startTime = ticket.deliveredAt
  }

  const start = new Date(startTime).getTime()
  const now = new Date().getTime()

  const diff = Math.floor((now - start) / 1000)

  return Math.floor(diff / 60)
}

export default function TicketCard({ ticket, updateStatus, completeTicket }: Props) {

  const minutes = getElapsedMinutes (ticket)

  let borderColor = "transparent"

  if (minutes >= 20) borderColor = "red"
  else if (minutes >= 15) borderColor = "orange"

const canSelectDelivery =
  ticket.status === "PREPARING"

const canComplete =
  ticket.status === "LIGHT" ||
  ticket.status === "TRAY" ||
  ticket.status === "CART"

  return (
    <div
      style={{
        backgroundColor: getColor(ticket.status),
        border: `4px solid ${borderColor}`,
        padding: "15px",
        borderRadius: "10px",
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: "32px" }}>
        {ticket.roomNumber}
      </div>

      <div>{ticket.status}</div>

      <div style={{ fontSize: "14px", marginTop: "5px" }}>
        {getElapsedTime(ticket)}
      </div>

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "5px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >

        <button
          disabled={!canSelectDelivery}
          style={{ 
            opacity: canSelectDelivery ? 1 : 0.4,
            padding: "6px 10px",
            fontWeight: "bold"
          }}
          onClick={() => updateStatus(ticket.id, "LIGHT")}
        >
          LIGHT
        </button>

        <button
        disabled={!canSelectDelivery}
        style={{ opacity: canSelectDelivery ? 1 : 0.4 }}
        onClick={() => updateStatus(ticket.id, "TRAY")}
      >
        TRAY
      </button>

        <button
          disabled={!canSelectDelivery}
          style={{ opacity: canSelectDelivery ? 1 : 0.4 }}
          onClick={() => updateStatus(ticket.id, "CART")}
        >
          CART
        </button>

        <button
          disabled={!canComplete}
          style={{ opacity: canComplete ? 1 : 0.4 }}
          onClick={() => completeTicket(ticket.id)}
        >
          DONE
        </button>

      </div>
    </div>
  )
}