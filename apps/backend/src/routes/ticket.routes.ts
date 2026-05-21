import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller";

const router = Router();

router.post("/", ticketController.createTicket);
router.get("/active", ticketController.getActiveTickets);
router.patch("/:id/status",ticketController.updateTicketStatus);
router.patch("/:id/complete", ticketController.completeTicket);

export default router;