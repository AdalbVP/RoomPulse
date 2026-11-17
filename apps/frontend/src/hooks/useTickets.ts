import { useCallback, useEffect, useState } from "react"
import { socket } from "../services/socket"
import * as api from "../services/api"
import type { DeliveryStatus, Ticket } from "../types"

const ERROR_VISIBLE_MS = 5000

function messageOf(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong"
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [connected, setConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // serverTime - localTime, in ms. Timers use the server's clock so that every
  // device shows the same elapsed time, even if its own clock is off.
  const [clockOffset, setClockOffset] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Loads the real state from the server (REST). Used on startup, after a
  // reconnection and after a failed action, so the screen never stays stale.
  const sync = useCallback(async () => {
    try {
      const before = Date.now()
      const serverNow = await api.fetchServerTime()
      const after = Date.now()

      // Assume the server read its clock halfway through the round trip
      setClockOffset(serverNow - (before + after) / 2)
      setTickets(await api.fetchActiveTickets())
    } catch (err) {
      setError(messageOf(err))
    }
  }, [])

  useEffect(() => {
    void sync()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    // Events can arrive after a sync already included the change, so
    // created/updated tickets are "upserted" instead of blindly appended.
    const onTicketChanged = (ticket: Ticket) =>
      setTickets((prev) =>
        prev.some((t) => t.id === ticket.id)
          ? prev.map((t) => (t.id === ticket.id ? ticket : t))
          : [...prev, ticket]
      )

    const onTicketCompleted = (ticket: Ticket) =>
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id))

    socket.on("connect", onConnect)
    socket.on("connect_error", onDisconnect)
    socket.on("disconnect", onDisconnect)
    socket.on("ticketCreated", onTicketChanged)
    socket.on("ticketUpdated", onTicketChanged)
    socket.on("ticketCompleted", onTicketCompleted)

    // Fires when a dropped connection comes back (not on the very first connect):
    // everything that happened meanwhile was missed, so reload the state.
    socket.io.on("reconnect", sync)

    return () => {
      socket.off("connect", onConnect)
      socket.off("connect_error", onDisconnect)
      socket.off("disconnect", onDisconnect)
      socket.off("ticketCreated", onTicketChanged)
      socket.off("ticketUpdated", onTicketChanged)
      socket.off("ticketCompleted", onTicketCompleted)
      socket.io.off("reconnect", sync)
    }
  }, [sync])

  // One tick per second, on the server's clock
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + clockOffset), 1000)
    return () => clearInterval(id)
  }, [clockOffset])

  // Error messages disappear on their own
  useEffect(() => {
    if (!error) return

    const id = setTimeout(() => setError(null), ERROR_VISIBLE_MS)
    return () => clearTimeout(id)
  }, [error])

  // The screen is updated by the socket events, so on success there is nothing to do here
  const updateStatus = useCallback(
    async (id: string, status: DeliveryStatus) => {
      try {
        await api.updateTicketStatus(id, status)
      } catch (err) {
        setError(messageOf(err))
        void sync()
      }
    },
    [sync]
  )

  const completeTicket = useCallback(
    async (id: string) => {
      try {
        await api.completeTicket(id)
      } catch (err) {
        setError(messageOf(err))
        void sync()
      }
    },
    [sync]
  )

  return {
    tickets,
    now,
    connected,
    error,
    dismissError: () => setError(null),
    updateStatus,
    completeTicket,
  }
}
