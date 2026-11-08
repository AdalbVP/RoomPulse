import express from "express"
import http from "http"
import ticketRoutes from "./routes/ticket.routes"
import { initSocket } from "./sockets/socket"
import cors from "cors"
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler"

const app = express()

app.use(cors())

app.use(express.json())
app.use("/tickets", ticketRoutes)

// Order matters: unknown routes first, error handler always last
app.use(notFoundHandler)
app.use(errorHandler)

const PORT = 3000

const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
