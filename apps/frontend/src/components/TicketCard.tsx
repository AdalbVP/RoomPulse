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
      return "💡 LIGHT"

    case "TRAY":
      return "🍽️ TRAY"

    case "CART":
      return "🛒 CART"

    default:
      return "🧑‍🍳 PREPARING"
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

  let boxShadow = "none"
  let animation = "none"

  if (borderColor === "orange") {
    boxShadow = "0 0 15px rgba(255,165,0,0.6)"
  }

  if (borderColor === "red") {
    boxShadow = "0 0 20px rgba(255,0,0,0.8)"
    animation = "pulseRed 1.8s infinite"
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",

        border: `4px solid ${borderColor}`,
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
      fontSize: "42px",
      fontWeight: "700"
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
        {getElapsedTime(ticket)}
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
            opacity: canSelectDelivery ? 1 : 0.4,
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "10px",
            minWidth: "90px",
            fontWeight: "bold"
          }}
          onClick={() => updateStatus(ticket.id, "LIGHT")}
        >
          LIGHT
        </button>

        <button
        disabled={!canSelectDelivery}
        style={{ 
          opacity: canSelectDelivery ? 1 : 0.4,
          padding: "12px 16px",
          fontSize: "16px",
          borderRadius: "10px",
          minWidth: "90px",
          fontWeight: "bold"
        }}
        onClick={() => updateStatus(ticket.id, "TRAY")}
      >
        TRAY
      </button>

        <button
          disabled={!canSelectDelivery}
          style={{ 
            opacity: canSelectDelivery ? 1 : 0.4,
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "10px",
            minWidth: "90px",
            fontWeight: "bold"
          }}
          onClick={() => updateStatus(ticket.id, "CART")}
        >
          CART
        </button>

        <button
          disabled={!canComplete}
          style={{ 
            opacity: canComplete ? 1 : 0.4,
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "10px",
            minWidth: "90px",
            fontWeight: "bold"
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