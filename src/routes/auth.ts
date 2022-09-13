import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//login
router.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  db.select("*")
    .from("employees")
    .where("email", "=", email)
    .then(async (data) => {
      const isValid = await bcrypt.compare(password, data[0].password);
      if (isValid) {
        const token = jwt.sign({ empId: data[0].id }, process.env.SECRET_KEY!, {
          expiresIn: "2h",
        });

        const options = {
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
          httpOnly: true,
        };

        res.status(200).cookie("token", token, options).json({
          message: "Login Successfull",
          user: data[0],
          token,
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
