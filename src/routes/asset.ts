import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";

interface Asset {
  assetId?: number;
  brandId: number;
  name: string;
  assetType: string;
  category: string;
  modelNo: number;
  description: string;
  status: "allocated" | "available";
  usability: "usable" | "unusable" | "disposed";
  addedTime: string;
}

//get all assets
router.get("/", async (_, res: Response) => {
  db<Asset>("assets")
    .select("*")
    .then((data) => {
      res.status(200).json({
        message: "All assets fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//get a single asset
router.get("/:assetId", async (req: Request, res: Response) => {
  const { assetId } = req.params;
  db<Asset>("assets")
    .select("*")
    .join("brands", "assets.brandId", "=", "brands.brandid")
    .where("assetId", "=", assetId)
    .then((data) => {
      res.status(200).json({
        message: `Asset ${assetId} fetched successfully`,
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//get all assets of a single employee
router.get("/employeeAssets/:empId", async (req, res) => {
  const { empId } = req.params;
  db.select(
    "assets.assetId",
    "brands.name",
    "assets.modelno",
    "assets.category",
    "assetallocation.allocationTime"
  )
    .from("assetallocation")
    .join("assets", "assetallocation.assetId", "=", "assets.assetId")
    .join("brands", "assets.brandId", "=", "brands.brandid")
    .where("assetallocation.empId", empId)
    .then((data) => {
      res.status(200).json({
        message: `All assets fetched for employee: ${empId} successfully`,
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//create a new asset
router.post("/addAsset", async (req, res) => {
  try {
    const {
      assetName,
      brandName,
      assetType,
      category,
      modelNo,
      description,
      status,
      usability,
    } = req.body;

    //find brand Id using the brand name given in request body
    const brandArr = await db("brands")
      .select("brandId")
      .where("name", "=", brandName);
    const brandId = brandArr[0].brandId;

    const asset: Asset = {
      brandId,
      name: assetName,
      assetType,
      category,
      modelNo,
      description,
      status,
      usability,
      addedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    db<Asset>("assets")
      .insert(asset)
      .then(() =>
        res.status(200).json({
          message: "Asset created successfully",
        })
      );
  } catch (error) {
    res.status(400).json({ error });
  }
});

export default router;
