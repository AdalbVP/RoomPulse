import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { fetchActiveTickets } from "../services/api";

export function useTickets() {

  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {

    // cargar tickets existentes
    fetchActiveTickets().then(setTickets);

    // escuchar nuevos tickets
    socket.on("ticketCreated", (ticket) => {
      setTickets((prev) => [...prev, ticket]);
    });

    socket.on("ticketUpdated", (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    });

    socket.on("ticketCompleted", (completed) => {
      setTickets((prev) =>
        prev.filter((t) => t.id !== completed.id)
      );
    });

    return () => {
      socket.off("ticketCreated");
      socket.off("ticketUpdated");
      socket.off("ticketCompleted");
    };

  }, []);

  return tickets;
}