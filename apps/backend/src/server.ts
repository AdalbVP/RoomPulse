import http from "http"
import { config } from "./config"
import { app } from "./app"
import { initSocket } from "./sockets/socket"

const server = http.createServer(app)

initSocket(server)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
