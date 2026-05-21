import express from "express"
import http from "http"
import ticketRoutes from "./routes/ticket.routes"
import { initSocket } from "./sockets/socket"
import cors from "cors"

const app = express()

app.use(cors())

app.use(express.json())
app.use("/tickets", ticketRoutes)

const PORT = 3000

const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})