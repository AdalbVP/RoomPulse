import { config } from "./config"
import express from "express"
import http from "http"
import ticketRoutes from "./routes/ticket.routes"
import { initSocket } from "./sockets/socket"
import cors from "cors"
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler"

const app = express()

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

const server = http.createServer(app)

initSocket(server)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
