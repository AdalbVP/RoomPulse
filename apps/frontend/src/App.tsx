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

  return (
    <div style={{ padding: "20px", height: "100vh", overflowY: "auto" }}>
      <h1>RoomPulse</h1>
      
      <CreateTicket />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px"
        }}
      >
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            updateStatus={updateStatus}
            completeTicket={completeTicket}
          />
        ))}
      </div>
    </div>
  )
}

export default App