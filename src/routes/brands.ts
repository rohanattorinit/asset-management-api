import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import { isAuth } from "../middleware/authorization";

interface Brand {
  brandId?: number;
  name: string;
}



//add new brand
router.post("/", isAuth, async (req: Request, res: Response) => {
  const { name }: { name: string } = req.body;
  db<Brand>("brands")
    .insert({
      name,
    })
    .then(() => {
      res.status(200).json({ message: "Brand Added Successfull!" });
    })
    .catch((error) => res.status(400).json({ error }));
});

//get all brands
router.get("/", isAuth, async (_, res: Response) => {
  db<Brand>("brands")
    .select("*")
    .then((data: any) => {
      res.status(200).json({ data });
    })
    .catch((error: Error) => res.status(400).json({ error }));
});





export default router;
