// Fires two requests at the same instant on the SAME ticket.
// Usage (backend running, ticket must be in PREPARING):
//   node scripts/race-test.mjs <ticketId>
// Expected: one 200 and one 409. Two 200s mean the race condition is still there.

const [id] = process.argv.slice(2)

if (!id) {
  console.error("Usage: node scripts/race-test.mjs <ticketId>")
  process.exit(1)
}

const url = `http://localhost:3000/tickets/${id}/status`

async function call(status) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, code: body?.error?.code ?? "-" }
}

// Two "devices" choose different delivery types at the same time
const results = await Promise.all([call("LIGHT"), call("TRAY")])

console.log("Results:", results)

const winners = results.filter((r) => r.status === 200).length

if (winners === 1) {
  console.log("OK: exactly one request won, the other one was rejected")
} else if (winners === 0) {
  console.log(
    "NOT A VALID TEST: no request won. The ticket is probably no longer in PREPARING (409) " +
      "or does not exist (404). Create a new ticket and use its id."
  )
} else {
  console.log("PROBLEM: both requests updated the ticket, the race condition is still there")
}
