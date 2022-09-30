import { isAdmin, isAuth } from "./../middleware/authorization";
import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";

interface Ticket {
  ticketId?: number;
  empId: number;
  assetId: number;
  title: string;
  description: string;
  ticketStatus: "active" | "pending" | "closed";
  createdAt: string;
}

interface TicketStatus {
  tickstatusId?: number;
  ticketId: number;
  note: string;
  createdAt: string;
}

//create a new ticket
router.post("/createTicket", isAuth, async (req: Request, res: Response) => {
  const { empId, assetId, title, description } = req.body;
  const ticket: Ticket = {
    empId,
    assetId,
    title,
    description,
    ticketStatus: "active",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  };
  db<Ticket>("tickets")
    .insert(ticket)
    .then(() => {
      res.status(200).json({ message: "Ticket created Successfully!" });
    })
    .catch((error) => res.status(400).json({ error }));
});

//view created ticket
router.get(
  "/employeeTickets/:empId",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      const { empId } = req.params;
      db<Ticket>("tickets")
        .select("*")
        .where("empId", "=", empId)
        .then((data) => {
          res.status(200).json({
            message: `Tickets fetched successfully for employee ${empId}`,
            data,
          });
        });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

//get all tickets
router.get("/", isAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, status } = req.query;

    db<Ticket>("tickets")
      .select("*")
      .where("title", "like", `%${title}`)
      .modify((queryBuilder) => {
        if (status) {
          queryBuilder?.where("ticketStatus", "=", `${status}`);
        } else if (title) {
          queryBuilder?.where("title", "like", `%${title}%`);
        }
      })
      .then((data) => {
        res.status(200).json({
          message: `All Tickets fetched successfully`,
          data,
        });
      });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//get single ticket
router.get("/:ticketId", isAuth, async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  try {
    db<Ticket>("tickets")
      .select("*")
      .where("ticketId", "=", ticketId)
      .then((data) => {
        res.status(200).json({
          message: `Ticket fetched successfully`,
          data: data[0],
        });
      });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//comment/note on a ticket
router.post(
  "/note/:ticketId",
  isAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const { note }: { note: string } = req.body;
    const ticketStatus = {
      ticketId: parseInt(ticketId, 10),
      note,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    db<TicketStatus>("ticketstatus")
      .insert(ticketStatus)
      .then(() => {
        res.status(200).json({ message: "Ticket note added Successfully!" });
      })
      .catch((error) => res.status(400).json({ error }));
  }
);

//update status of a ticket
router.post(
  "/changeStatus/:ticketId",
  isAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const { status }: { status: "active" | "pending" | "closed" } = req.body;

    db<Ticket>("tickets")
      .update({
        ticketStatus: status,
      })
      .where("ticketId", "=", ticketId)
      .then(() => {
        res
          .status(200)
          .json({ message: "Ticket status updated Successfully!" });
      })
      .catch((error) => res.status(400).json({ error }));
  }
);

router.get(
  "/getTicketDetails/:ticketId",
  isAuth,
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      db.from("ticketstatus")
        .join("tickets", "tickets.ticketId", "ticketstatus.ticketId")
        .where("tickets.ticketId", ticketId!)
        .select(
          "ticketstatus.ticketstatusId",
          "ticketstatus.note",
          "ticketstatus.createdAt"
        )
        .then((data) => {
          res.status(200).json({
            message: `All updated notes fetched successfully for employee`,
            data,
          });
        });
    } catch (error) {
      res
        .status(400)
        .json({
          error: "Error occured while fetching tickets from db",
          errorMsg: error,
        });
    }
  }
);

export default router;
