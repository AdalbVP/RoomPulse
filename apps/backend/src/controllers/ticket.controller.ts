import { Request, Response } from "express";
import * as ticketService from "../services/ticket.service";
import { ServiceStatus } from "@prisma/client";
import { getIO } from "../sockets/socket";

export async function createTicket(req: Request, res: Response) {
  const { roomNumber } = req.body;

  if (!roomNumber) {
    return res.status(400).json({ error: "roomNumber is required" });
  }

  const ticket = await ticketService.createTicket(roomNumber);

  const io= getIO();
  io.emit("ticketCreated", ticket);

  res.json(ticket);
}

export async function getActiveTickets(req: Request, res: Response) {
  const tickets = await ticketService.getActiveTickets();

  res.json(tickets);
}

export async function updateTicketStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status || !Object.values(ServiceStatus).includes(status)) {
    return res.status(400).json({
      error: "Invalid status"
    });
  }

  const ticket = await ticketService.updateTicketStatus(
    id,
    status as ServiceStatus
  );

  const io = getIO();
io.emit("ticketUpdated", ticket);

  res.json(ticket);
}


export async function completeTicket(req: Request, res: Response) {
  const id = req.params.id as string;

  const ticket = await ticketService.completeTicket(id);

  const io = getIO();
io.emit("ticketCompleted", ticket);

  res.json(ticket);
}