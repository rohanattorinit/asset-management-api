import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";
import { isAdmin, isAuth } from "../middleware/authorization";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
const upload = multer({ dest: "/tmp" });

interface Asset {
  assetId?: number;
  brandId: number;
  name: string;
  assetType: "software" | "hardware";
  category: string;
  modelNo: string;
  description: string;
  status: "allocated" | "available";
  usability: "usable" | "unusable" | "disposed";
  asset_location: string;
  addedTime: string;
  isRented?: boolean;
  vendor?: string;
  rent?: number;
  deposit?: number;
  rentStartDate?: string;
  rentEndDate?: string;
}

interface UpdateAssetType{
  name?: string;
  modelNo?: string;
  description?: string;
  status?: "available"|"allocated";
  usability?: "usable"|"unusable"|"disposed";
  isRented: boolean;
  vendor?: string;
  rent?: number;
  deposit?: number;
  rentStartDate?: string;
  rentEndDate?: string;
}

//get all assets
router.get("/", isAuth, isAdmin, async (req, res: Response) => {
  const { name, allocate, assetType, isRented } = req?.query;
  db<Asset>("assets")
    .select("*")
    .modify((queryBuilder) => {
      if (allocate === "true") {
        queryBuilder?.where("status", `available`).where("usability", "usable");
      }
      if (isRented === "0" || isRented === "1") {
        queryBuilder?.where("isRented", "=", `${isRented}`);
      }
      if (assetType === "hardware" || assetType === "software") {
        queryBuilder?.where("assetType", "=", assetType);
      }
    })
    .where("name", "like", `%${name}%`)
    .then((data) => {
      res.status(200).json({
        message: "All assets fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({ error: "Error occured while fetching assets!" });
    });
});

//get all details of a single asset
router.get(
  "/:assetId",
  isAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const { assetId } = req.params;
    //join employees and assets from assetallocation table and fetch asset details
    db.select('assets.assetId','brands.name as brandName','assets.name','assets.description','assets.modelNo','assets.status','assets.usability',
    'assets.asset_location','assets.isRented','assets.vendor','assets.rent','assets.deposit','assets.rentStartDate','assets.rentEndDate')
      .from('assets')
      .join("brands", "assets.brandId", "=", "brands.brandId")
      .where("assets.assetId", "=", assetId)
      .then((data) => {
        res.status(200).json({
          message: `Asset with assetId:${assetId} fetched successfully`,
          data: data[0],
        })
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  }
);

//get all assets of a single employee
router.get("/employeeAssets/:empId", isAuth, async (req, res) => {
  const { empId } = req.params;
  db.select(
    "assets.assetId",
    "assets.name",
    
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
router.post("/addAsset", isAuth, isAdmin, async (req, res) => {
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
      isRented,
      asset_location,
      vendor,
      rent,
      deposit,
      rentStartDate,
      rentEndDate,
    } = req.body;
    if (isRented) {
      if (!vendor || !deposit || !rentStartDate || !rentEndDate) {
        return res
          .status(400)
          .json({ error: "Please provide rental details!" });
      }
    }
    //find brand Id using the brand name given in request body
    const brandArr = await db("brands")
      .select("brandId")
      .where("name", "=", brandName);
    const brandId = brandArr[0].brandId;
    const asset: Asset = isRented
      ? {
          brandId,
          name: assetName,
          assetType,
          category,
          modelNo,
          description,
          status,
          usability,
          asset_location,
          addedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
          isRented,
          vendor,
          rent,
          deposit,
          rentStartDate,
          rentEndDate,
        }
      : {
          brandId,
          name: assetName,
          assetType,
          category,
          modelNo,
          isRented,
          description,
          status,
          usability,
          asset_location,
          addedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    db<Asset>("assets")
      .insert(asset)
      .then(() => {
        res.status(200).json({
          message: "Asset created successfully",
        });
      })
      .catch((error) => {
        //Tocheck Whether it is present in db(dublicate entry)
        if (error.code === "ER_DUP_ENTRY") {
          res.status(400).json({
            error: "Asset Already Exists",
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

//add bulk assets
router.post(
  "/create-bulk",
  isAuth,
  isAdmin,
  upload.single("csvFile"),
  async (req: Request, res: Response) => {
    try {
      const results: Asset[] = [];
      fs.createReadStream(req.file?.path!)
        .pipe(csv())
        .on("data", (data: Asset) => results.push(data))
        .on("end", async () => {
          const assets = results.map(async (result: any) => {
            return await db("brands")
              .select("brandId")
              .where("name", "=", result.brandName)
              .then((data) => {
                delete result["brandName"];
                result.brandId = data[0].brandId;
                result.addedTime = moment().format("YYYY-MM-DD HH:mm:ss");

                return result;
              });
          });

          Promise.all(assets).then((results) => {
            db<Asset>("assets")
              .insert(results as unknown as Asset)
              .then(() => {
                res.status(200).json({ message: "Assets added Successfully!" });
              });
          });
        });
    } catch (error) {
      res.status(400).json({ error: "Error while creating adding assets" });
    }
  }
);

//update assets
router.post("/update/:id", isAuth, async (req: Request, res: Response) => {
  const { 
    name,
    modelNo,
    description,
    status,
    usability,
    brandName,
    isRented,
    vendor,
    rent,
    deposit,
    rentStartDate,
    rentEndDate } = req.body;
  const { id } = req.params;

  const asset: UpdateAssetType={
    name,
    modelNo,
    description,
    status,
    usability,
    isRented,
    vendor,
    rent,
    deposit,
    rentStartDate,
    rentEndDate
  }
try {
  db<Asset>("assets")
  .where("assetId", id)
  .update(asset)
  .then(() => {
    if(brandName){
      db("brands")
      .where("name",brandName)
      .update({name: brandName})
      .catch(err=>res.status(400).json({ error:'Error occured while updating Brand Name of the asset',errorMsg:err}))
    }
    res.status(200).json({message:'Asset Updated successfully!'})
  })
  .catch((error) => {
    res.status(400).json({ error:'An error occured while trying to edit the asset',errorMsg:error})
  })
} catch (error) {
  res.status(400).json({ error:'An error occured while trying to edit the asset',errorMsg:error})
}});

export default router;
