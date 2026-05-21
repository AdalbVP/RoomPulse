import { prisma } from "../lib/prisma";
import { ServiceStatus } from "@prisma/client";

export async function createTicket(roomNumber: number) {
  return prisma.serviceTicket.create({
    data: {
      roomNumber
    }
  });
}

export async function getActiveTickets() {
  return prisma.serviceTicket.findMany({
    where: {
      completedAt: null
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function updateTicketStatus(id: string, status: ServiceStatus) {

  const ticket = await prisma.serviceTicket.findUnique({
    where: { id }
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const data: any = {
    status
  };

  if (ticket.status === "PREPARING") {
    data.deliveredAt = new Date();
  }

  return prisma.serviceTicket.update({
    where: { id },
    data
  });
}

export async function completeTicket(id: string) {
  return prisma.serviceTicket.update({
    where: {
      id
    },
    data: {
      status: "COMPLETED",
      completedAt: new Date()
    }
  });
}