import { isAuth, isAdmin } from "./../middleware/authorization";
import express, { Request, Response } from "express";
const router = express.Router();
import moment from "moment";
import db from "../config/connection";
import bcrypt from "bcrypt";

//allocate an asset to an employee
router.post(
  "/allocateAsset/:empId",
  isAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    // const { empId } = req.params;
    // const { assetId } = req.body;
    const{allocationObj} =req.body;
    // const assetallocation = assetId?.map((asset: number) => {
    //   return { empId, assetId: asset, allocationTime };
    // });
    allocationObj?.map((asset: { empId: string; assetId: number; allocationTime: string}) => {
      db("assets")
        .update({ status: "allocated" })
        .where("assetId", asset?.assetId)
        .catch((error) => res.status(400).json({ error:`Error occured while trying to allocate asset: ${asset?.assetId}` }));
    });
    db("assetallocation")
      .insert(allocationObj)
      .then(() => {
        res.status(200).json({ message: "Asset allocated Successfully!" });
      })
      .catch((error) => res.status(400).json({ error }));
  }
);

//deallocate an asset
router.post(
  "/deallocateAsset/:empId/:assetId",
  isAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const { empId, assetId } = req.params;
    db("assetallocation")
      .where("empId", empId)
      .where("assetId", assetId)
    
      .del()
      .then(() => {
        db("assets")
          .update({ status: "surplus" })
          .where("assetId", assetId)
          .then(() => {
            res
              .status(200)
              .json({ message: "Asset deallocated Successfully!" });
          })
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(400).json({ error }));
  }
);

export default router;
