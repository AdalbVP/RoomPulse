import express from "express"
import cors from "cors"
import { config } from "./config"
import ticketRoutes from "./routes/ticket.routes"
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler"

// The Express app lives here, separate from server.ts, so the tests can use it
// without opening a port or starting Socket.IO.
export const app = express()

app.use(cors({ origin: config.corsOrigin }))

app.use(express.json())
app.use("/tickets", ticketRoutes)

// Lets clients align their clocks with the server (the ticket timers depend on it)
app.get("/time", (_req, res) => {
  res.json({ now: new Date().toISOString() })
})

// Order matters: unknown routes first, error handler always last
app.use(notFoundHandler)
app.use(errorHandler)
