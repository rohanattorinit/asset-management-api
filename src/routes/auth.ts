import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isAuth, RequestCustom } from "../middleware/authorization";

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
  if (!email || !password)
    res.status(400).json({ error: "Email or Password missing" });
  try {
    db<EmployeeType>("employees")
      .select("*")
      .where("email", "=", email)
      .then(async (data) => {
        const isValid = await bcrypt.compare(password, data[0].password);
        if (isValid) {
          const token = jwt.sign(
            { empId: data[0]?.empId },
            process.env.SECRET_KEY!,
            {
              expiresIn: "2h",
            }
          );

          const options = {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
            httpOnly: true,
          };
          ``;
          const user = {
            empId: data[0]?.empId,
            name: data[0]?.name,
            email: data[0]?.email,
            phone: data[0]?.phone,
            location: data[0]?.location,
            isAdmin: data[0]?.isAdmin,
            jobTitle: data[0]?.jobTitle,
          };

          res.status(200).cookie("token", token, options).json({
            message: "Login Successfull!",
            token,
            user: user,
          });
        } else {
          res.status(400).json({ error: "Wrong credentials!" });
        }
      });
  } catch (error) {
    res.status(400).json({ error: "Error occured while logging in" });
  }
});

//change password
router.post(
  "/changePassword/",
  isAuth,
  async (req: RequestCustom, res: Response) => {
    const { password } = req.body;
    const userId = req.user;
    if (!userId || !password)
      res.status(400).json({ error: "Password or Id is missing" });
    const hash = await bcrypt.hash(password, 10);
    db("employees")
      .where("empId", userId)
      .update({ password: hash })
      .then(() => {
        res.status(200).json({ message: "Password Changed Successfully!" });
      })
      .catch((error) =>
        res
          .status(400)
          .json({ error: "Error occured while changing password!" })
      );
  }
);

//Get user profile
router.get("/profile", isAuth, async (req: RequestCustom, res: Response) => {
  const userId = req.user;

  db.select("*")
    .from("employees")
    .where("empId", "=", userId!)
    .then((data) => {
      if (data[0]) {
        const user = {
          empId: data[0]?.empId,
          name: data[0]?.name,
          email: data[0]?.email,
          phone: data[0]?.phone,
          location: data[0]?.location,
          isAdmin: data[0]?.isAdmin,
          jobTitle: data[0]?.jobTitle,
        };
        res.status(200).json({ user: user });
      } else {
        res.status(400).json({ error: "Employee not found!" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
});
export default router;
