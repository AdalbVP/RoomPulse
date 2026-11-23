import { Server } from "socket.io";
import { config } from "../config";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}