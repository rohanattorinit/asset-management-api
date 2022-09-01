import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";

interface Employee {
  empId: number;
  name: string;
  email: string;
  phone: number;
  password: string;
  location: string;
  isAdmin: boolean;
  jobTitle: string;
}

interface UpdateEmployee {
  name: string;
  email: string;
  phone: number;
  location: string;
  jobTitle: string;
}

//get all employees
router.get("/", async (_, res: Response) => {
  db.select("*")
    .from("employees")
    .then((data) => {
      res.status(200).json({
        message: "All employees fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//get a single employee
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  db.select("*")
    .from("employees")
    .where("empId", "=", id)
    .then((data) => {
      if (data[0]) {
        res.status(200).json({ data });
      } else {
        res.status(400).json({ error: "Employee not found!" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
});

//update an employee
router.post("/update/:id", async (req: Request, res: Response) => {
  const { name, email, phone, location, jobTitle } = req.body;
  const { id } = req.params;
  const employee: UpdateEmployee = {
    name,
    email,
    phone,
    location,
    jobTitle,
  };
  db<Employee>("employees")
    .where("empId", id)
    .update(employee)
    .then(() => {
      res
        .status(200)
        .json({ message: "Employee details Updated successfully" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

export default router;
