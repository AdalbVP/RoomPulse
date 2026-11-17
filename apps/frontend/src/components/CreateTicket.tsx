import { useState } from "react"
import { createTicket } from "../services/api"

type Props = {
  onCreated?: () => void
}

export default function CreateTicket({ onCreated }: Props) {
  const [roomNumber, setRoomNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!roomNumber) return

    const number = Number(roomNumber)

    if (!Number.isInteger(number)) {
      setError("Room number must be a whole number")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await createTicket(number)

      setRoomNumber("")

      if (onCreated) onCreated()
    } catch (err) {
      // The server has the final word (for example the allowed room range)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center"
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
        style={{ padding: "8px", width: "120px" }}
      />

      <button onClick={handleCreate} disabled={loading || !roomNumber}>
        {loading ? "Creating..." : "Create Ticket"}
      </button>

      {error && (
        <span role="alert" style={{ color: "#B91C1C", fontSize: "14px" }}>
          {error}
        </span>
      )}
    </div>
  )
}
