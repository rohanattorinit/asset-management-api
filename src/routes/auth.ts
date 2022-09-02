import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import bcrypt from "bcrypt";

//login
router.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  db.select("email", "password", "isAdmin")
    .from("employees")
    .where("email", "=", email)
    .then(async (data) => {
      console.log(data[0].password);
      const isValid = await bcrypt.compare(password, data[0].password);
      if (isValid) {
        res
          .status(200)
          .json({ message: "Login Successfull", isAdmin: data[0].isAdmin });
      } else {
        res.status(400).json({ error: "Wrong credentials!" });
      }
    })
    .catch((error) => res.status(400).json({ error: "User not found!" }));
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
    });
});

export default router;
