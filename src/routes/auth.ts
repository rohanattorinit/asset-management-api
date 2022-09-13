import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface EmployeeType {
  empId: string;
  name: string;
  email: string;
  phone: number;
  password: string;
  location: string;
  isAdmin: boolean;
  jobTitle: string;
}

//login
router.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  db<EmployeeType>("employees")
    .select("*")
    .where("email", "=", email)
    .then(async (data) => {
      const isValid = await bcrypt.compare(password, data[0].password);
      if (isValid) {
        const token = jwt.sign(
          { empId: data[0].empId },
          process.env.SECRET_KEY!,
          {
            expiresIn: "2h",
          }
        );

        const options = {
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
          httpOnly: true,
        };

        const user = {
          empId: data[0].empId,
          name: data[0].name,
          email: data[0].email,
          phone: data[0].phone,
          location: data[0].location,
          isAdmin: data[0].isAdmin,
          jobTitle: data[0].jobTitle,
        };
        res.status(200).cookie("token", token, options).json({
          message: "Login Successfull",
          token,
          user: user,
        });
      } else {
        res.status(400).json({ error: "Wrong credentials!" });
      }
    })
    .catch((error) => res.status(400).json({ error: error }));
});

//change password
router.post("/changePassword/:id", async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;
  const hash = await bcrypt.hash(password, 10);
  db("employees")
    .where("empId", id)
    .update({ password: hash })
    .then(() => {
      res.status(200).json({ message: "Password Changed Successfully!" });
    })
    .catch((error) => res.status(400).json({ error }));
});

export default router;
