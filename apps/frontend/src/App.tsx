import TicketCard from "./components/TicketCard"
import CreateTicket from "./components/CreateTicket"
import { useTickets } from "./hooks/useTickets"
import type { Ticket } from "./types"

const bannerStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  marginBottom: "16px",
  fontSize: "14px",
  fontWeight: 600
} as const

function App() {
  const {
    tickets,
    now,
    connected,
    error,
    dismissError,
    updateStatus,
    completeTicket
  } = useTickets()

const sortByOldest = (a: Ticket, b: Ticket) =>
  new Date(a.createdAt).getTime() -
  new Date(b.createdAt).getTime()

const preparingTickets = tickets
  .filter(t => t.status === "PREPARING")
  .sort(sortByOldest)

const lightTickets = tickets
  .filter(t => t.status === "LIGHT")
  .sort(sortByOldest)

const trayTickets = tickets
  .filter(t => t.status === "TRAY")
  .sort(sortByOldest)

const cartTickets = tickets
  .filter(t => t.status === "CART")
  .sort(sortByOldest)

  return (
    <div
      style={{
     padding: "24px",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#F5F7FC",
      overflowY: "auto",
      boxSizing: "border-box"
    }}
    >
      <h1
        style={{
          color: "#3447AA",
          fontSize: "48px",
          marginBottom: "20px"
        }}
        >
          RoomPulse
        </h1>
      
      {!connected && (
        <div
          role="status"
          style={{
            ...bannerStyle,
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #FCD34D"
          }}
        >
          Connection lost. Reconnecting... Tickets may be out of date.
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            ...bannerStyle,
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            border: "1px solid #FCA5A5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <span>{error}</span>

          <button
            onClick={dismissError}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              fontSize: "20px",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>
      )}

      <CreateTicket />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          alignItems: "start"
        }}
      >

    {/* PREPARING */}
    {preparingTickets.length > 0 && (
    <div>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          color: "#1F2937",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold"
        }}
      >
        <span>🧑‍🍳 PREPARING</span>

        <span
          style={{
            backgroundColor: "#3447AA",
            color: "white",
            padding: "4px 10px",
            borderRadius: "999px"
          }}
        >
          {preparingTickets.length}
        </span>
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {preparingTickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            updateStatus={updateStatus}
            completeTicket={completeTicket}
            now={now}
          />
        ))}
      </div>

    </div>
    )}

    {/* LIGHT */}
    {lightTickets.length > 0 && (
    <div>
  <div
    style={{
      backgroundColor: "#2f3542",
      color: "white",
      padding: "12px 16px",
      borderRadius: "12px",
      marginBottom: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: "bold"
    }}
  >
    <span>💡 LIGHT</span>

    <span
      style={{
        backgroundColor: "#57606f",
        padding: "4px 10px",
        borderRadius: "999px"
      }}
    >
      {lightTickets.length}
    </span>
  </div>

  <div style={{ display: "grid", gap: "15px" }}>
    {lightTickets.map(ticket => (
      <TicketCard
        key={ticket.id}
        ticket={ticket}
        updateStatus={updateStatus}
        completeTicket={completeTicket}
        now={now}
      />
    ))}
  </div>
</div>
    )}

{/* TRAY */}
{trayTickets.length >0 && (
<div>
  <div
    style={{
      backgroundColor: "#2f3542",
      color: "white",
      padding: "12px 16px",
      borderRadius: "12px",
      marginBottom: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: "bold"
    }}
  >
    <span>🍽️ TRAY</span>

    <span
      style={{
        backgroundColor: "#57606f",
        padding: "4px 10px",
        borderRadius: "999px"
      }}
    >
      {trayTickets.length}
    </span>
  </div>

  <div style={{ display: "grid", gap: "15px" }}>
    {trayTickets.map(ticket => (
      <TicketCard
        key={ticket.id}
        ticket={ticket}
        updateStatus={updateStatus}
        completeTicket={completeTicket}
        now={now}
      />
    ))}
  </div>
</div>
)}

{/* CART */}
{cartTickets.length > 0 && (
<div>
  <div
    style={{
      backgroundColor: "#2f3542",
      color: "white",
      padding: "12px 16px",
      borderRadius: "12px",
      marginBottom: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: "bold"
    }}
  >
    <span>🛒 CART</span>

    <span
      style={{
        backgroundColor: "#57606f",
        padding: "4px 10px",
        borderRadius: "999px"
      }}
    >
      {cartTickets.length}
    </span>
  </div>

  <div style={{ display: "grid", gap: "15px" }}>
    {cartTickets.map(ticket => (
      <TicketCard
        key={ticket.id}
        ticket={ticket}
        updateStatus={updateStatus}
        completeTicket={completeTicket}
        now={now}
      />
    ))}
  </div>
</div>
)}

</div>
</div>
  )
}

export default App