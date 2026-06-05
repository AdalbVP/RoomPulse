import { io } from "socket.io-client"
import { useEffect, useState } from "react"
import TicketCard from "./components/TicketCard"
import CreateTicket from "./components/CreateTicket"

const socket = io("http://localhost:3000")

type Ticket = {
  id: string
  roomNumber: number
  status: string
  createdAt: string
  deliveredAt: string | null
  completedAt: string | null
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [, setTick] = useState(0)

  // cargar tickets al iniciar
  useEffect(() => {
    fetch("http://localhost:3000/tickets/active")
      .then(res => res.json())
      .then(data => setTickets(data))
  }, [])

  // timer para actualizar el tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // eventos de socket (tiempo real)
  useEffect(() => {

    socket.on("ticketCreated", ticket => {
      setTickets(prev => [...prev, ticket])
    })

    socket.on("ticketUpdated", updatedTicket => {
      setTickets(prev =>
        prev.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
      )
    })

    socket.on("ticketCompleted", completedTicket => {
      setTickets(prev =>
        prev.filter(t => t.id !== completedTicket.id)
      )
    })

    return () => {
      socket.off("ticketCreated")
      socket.off("ticketUpdated")
      socket.off("ticketCompleted")
    }

  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`http://localhost:3000/tickets/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    })
  }

  async function completeTicket(id: string) {
    await fetch(`http://localhost:3000/tickets/${id}/complete`, {
      method: "PATCH"
    })
  }

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