import { useState } from "react"

type Props = {
  onCreated?: () => void
}

export default function CreateTicket({ onCreated }: Props) {
  const [roomNumber, setRoomNumber] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!roomNumber) return

    setLoading(true)

    await fetch("http://localhost:3000/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        roomNumber: Number(roomNumber)
      })
    })

    setRoomNumber("")
    setLoading(false)

    if (onCreated) onCreated()
  }

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        display: "flex",
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
    </div>
  )
}