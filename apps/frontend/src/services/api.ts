import type { DeliveryStatus, Ticket } from "../types"

// Single place for the backend URL. Set VITE_API_URL to point somewhere else.
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

type ApiErrorBody = {
  error?: {
    message?: string
    details?: { message?: string }[]
  }
}

// Every request goes through here so errors look the same everywhere:
// the backend's message becomes the Error message shown in the UI.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response

  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new Error("Cannot reach the server. Check your connection.")
  }

  if (!res.ok) {
    const body: ApiErrorBody | null = await res.json().catch(() => null)

    throw new Error(
      body?.error?.details?.[0]?.message ??
        body?.error?.message ??
        `Request failed (${res.status})`
    )
  }

  return res.json() as Promise<T>
}

const JSON_HEADERS = { "Content-Type": "application/json" }

export function fetchActiveTickets() {
  return request<Ticket[]>("/tickets/active")
}

// Server time in milliseconds
export async function fetchServerTime() {
  const { now } = await request<{ now: string }>("/time")
  return new Date(now).getTime()
}

export function createTicket(roomNumber: number) {
  return request<Ticket>("/tickets", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ roomNumber }),
  })
}

export function updateTicketStatus(id: string, status: DeliveryStatus) {
  return request<Ticket>(`/tickets/${id}/status`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  })
}

export function completeTicket(id: string) {
  return request<Ticket>(`/tickets/${id}/complete`, { method: "PATCH" })
}
