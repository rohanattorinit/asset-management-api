import jwt from "jsonwebtoken";
import { isAdmin, RequestCustom } from "./../middleware/authorization";
import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import multer from "multer";
const upload = multer({ dest: "/tmp" });
const router = express.Router();
import db from "../config/connection";
import { isAuth } from "../middleware/authorization";
import csv from "csv-parser";
import fs from "fs";
export interface EmployeeType {
  empId: string;
  name: string;
  email: string;
  phone: number;
  password: string;
  location: string;
  isAdmin?: boolean;
  jobTitle: string;
}

interface UpdateEmployee {
  name: string;
  email: string;
  phone: number;
  location: string;
  jobTitle: string;
}

//Add a new employee
router.post("/", isAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { empId, name, email, phone, location, jobTitle } = req.body;
    const hash = await bcrypt.hash(email, 10);
    const employee: EmployeeType = {
      empId,
      name,
      email,
      password: hash,
      phone,
      location,
      jobTitle,
    };

    db<EmployeeType>("employees")
      .insert(employee)
      .then(() => {
        res.status(200).json({ message: "Employee added Successfully!" });
      })
      .catch((error) => {
        //Tocheck Whether it is present in db(dublicate entry)
        if (error.code === "ER_DUP_ENTRY") {
          res.status(400).json({
            error: "Employee Already Exists",
            errorMsg: error,
          });
        } else {
          res.status(400).json({
            error: "Error occured while creating asset",
            errorMsg: error,
          });
        }
      });
  } catch (error) {
    res.status(400).json({ error });
  }
});

//Create bulk employees
router.post(
  "/create-bulk",
  isAuth,
  isAdmin,
  upload.single("csvFile"),
  async (req: Request, res: Response) => {
    const generateHash = async (email: string) => {
      return await bcrypt.hash(email, 10);
    };
    try {
      //validate size and type of file
      const results: EmployeeType[] = [];
      fs.createReadStream(req.file?.path!)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          const employees = results.map(async (result: EmployeeType) => {
            const hash = await generateHash(result.email);
            result.password = hash;
            return result;
          });

          Promise.all(employees).then((results) => {
            db<EmployeeType>("employees")
              .insert(results as unknown as EmployeeType)
              .then(() => {
                res.status(200).json({
                  message: "Employee added Successfully!",
                });
              });
          });
        });
    } catch (error) {
      res.status(400).json({
        error: "Error while creating adding employees",
      });
    }
  }
);

//get all employees

router.get("/", isAuth, isAdmin, async (req, res: Response) => {
  const name = req?.query?.name;

  db.select("*")
    .from("employees")
    .modify((queryBuilder) => {
      if (name) {
        queryBuilder?.where("name", "like", `%${name}%`);
      }
    })
    .then((data) => {
      res.status(200).json({
        message: "All employees fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res
        .status(400)
        .json({ error: "Error occured while trying to fetch employees" });
    });
});

//get a single employee
router.get("/:id", isAuth, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  db.select("*")
    .from("employees")
    .where("empId", "=", id)
    .then((data) => {
      if (data[0]) {
        res.status(200).json({ data: data[0] });
      } else {
        res.status(400).json({ error: "Employee not found!" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
});

//update an employee
router.post("/update/:id", isAuth, async (req: Request, res: Response) => {
  const { name, email, phone, location, jobTitle } = req.body;
  const { id } = req.params;
  const employee: UpdateEmployee = {
    name,
    email,
    phone,
    location,
    jobTitle,
  };

  db<EmployeeType>("employees")
  .where("empId", id)
  .update(employee)
  .then(() => {
    res.status(200).json({message:'Profile Updated successfully!'})
  })
  .catch((error) => {
    res.status(400).json({ error:'An error occured while trying to update profile',errorMsg:error})
  })
});

//delete an employee
router.delete("/:id", isAuth, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  db<EmployeeType>("employees")
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
