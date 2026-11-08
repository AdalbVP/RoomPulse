import { Request, Response } from "express";
import * as ticketService from "../services/ticket.service";
import { getIO } from "../sockets/socket";
import {
  createTicketSchema,
  ticketIdParamsSchema,
  updateStatusSchema,
} from "../schemas/ticket.schema";

// Validation errors thrown here (ZodError) reach the error middleware automatically:
// Express 5 forwards rejected promises from async handlers.

export async function createTicket(req: Request, res: Response) {
  const { roomNumber } = createTicketSchema.parse(req.body);

  const ticket = await ticketService.createTicket(roomNumber);

  getIO().emit("ticketCreated", ticket);

  res.status(201).json(ticket);
}

export async function getActiveTickets(_req: Request, res: Response) {
  const tickets = await ticketService.getActiveTickets();

  res.json(tickets);
}

export async function updateTicketStatus(req: Request, res: Response) {
  const { id } = ticketIdParamsSchema.parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);

  const ticket = await ticketService.updateTicketStatus(id, status);

  getIO().emit("ticketUpdated", ticket);

  res.json(ticket);
}

export async function completeTicket(req: Request, res: Response) {
  const { id } = ticketIdParamsSchema.parse(req.params);

  const ticket = await ticketService.completeTicket(id);

  getIO().emit("ticketCompleted", ticket);

  res.json(ticket);
}
