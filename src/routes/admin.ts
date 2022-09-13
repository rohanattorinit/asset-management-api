import express, { Request, Response } from "express";
const router = express.Router();
import moment from "moment";
import db from "../config/connection";
import bcrypt from "bcrypt";

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

export default router;
