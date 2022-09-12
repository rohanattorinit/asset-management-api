import express, { Request, Response } from "express";
const router = express.Router();
import moment from "moment";
import db from "../config/connection";
import bcrypt from "bcrypt";

interface Employee {
  empId: number;
  name: string;
  email: string;
  phone: number;
  password: string;
  location: string;
  isAdmin?: boolean;
  jobTitle: string;
}

router.post("/", (req: Request, res: Response) => {
  console.log(req);
  res.json({ message: "got the req" });
});

//Add a new employee
router.post("/addEmployee", async (req: Request, res: Response) => {
  const { empId, name, email, phone, location, jobTitle } = req.body;
  const hash = await bcrypt.hash(email, 10);
  const employee: Employee = {
    empId,
    name,
    email,
    password: hash,
    phone,
    location,
    jobTitle,
  };

  db<Employee>("employees")
    .insert(employee)
    .then(() => {
      res.status(200).json({ message: "Employee added Successfully!" });
    })
    .catch((error) => res.status(400).json({ error }));
});



//allocate an asset to an employee
router.post(
  "/allocateAsset/:empId/:assetId",
  async (req: Request, res: Response) => {
    console.log(req.params);
    const { empId, assetId } = req.params;
    const assetallocation = {
      empId,
      assetId,
      allocationtime: moment().format("YYYY-MM-DD HH:mm:ss"),
    };
    db("assetallocation")
      .insert(assetallocation)
      .then(() => {
        res.status(200).json({ message: "Asset allocated Successfully!" });
      })
      .catch((error) => res.status(400).json({ error }));
  }
);

//delete an employee
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  db<Employee>("employees")
    .where("empId", id)
    .del()
    .then(() => {
      res.status(200).json({ message: "Employee Deleted successfully" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

export default router;
