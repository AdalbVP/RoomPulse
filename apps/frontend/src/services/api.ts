export async function fetchActiveTickets() {
  const res = await fetch("http://localhost:3000/tickets/active");

  if (!res.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return res.json();
}