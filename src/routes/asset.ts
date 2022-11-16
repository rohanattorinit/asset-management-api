import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";
import { isAdmin, isAuth } from "../middleware/authorization";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import knex from "knex";
const upload = multer({ dest: "/tmp" });

interface Asset {
  assetId?: number;
  brandId: number;
  name: string;
  assetType: "software" | "hardware";
  category:
    | "laptop"
    | "mouse"
    | "hdmi cable"
    | "mobile"
    | "monitor"
    | "keyboard"
    | "headset"
    | "other";
  modelNo: string;
  description: string;
  status: "allocated" | "surplus" | "broken" | "repairable";
  //usability: "usable" | "unusable" | "disposed";

  processor: string;
  screen_type: string;
  ram: number;
  operating_system: string;
  screen_size: number;
  asset_location: string;
  addedTime: string;
  isRented?: boolean;
  vendor?: string;
  rent?: number;
  deposit?: number;
  rentStartDate?: string;
  rentEndDate?: string;
  empId?: string;
  hdd?: string;
  connectivity?: string;
  ssd?: string;
  cable_type?: string;
}

interface Filters {
  fieldId?: number;
  fields: string;
  filter_name: string;
}

//get all assets
router.get("/", async (req, res: Response) => {
  const { name, isRented } = req?.query;
  db<Asset>("assets")
    .select(
      "assets.assetId",
      "brands.name as brandName",
      "assets.name",
      "assets.description",
      "assets.modelNo",
      "assets.status",
      "assets.asset_location",
      "assets.isRented",
      "assets.vendor",
      "assets.rent",
      "assets.deposit",
      "assets.rentStartDate",
      "assets.rentEndDate",
      "assets.processor",
      "assets.screen_type",
      "assets.ram",
      "assets.operating_system",
      "assets.screen_size",
      "assets.addedTime",
      "assets.hdd",
      "assets.category",
      "assets.connectivity",
      "assets.ssd",
      "assets.cable_type"
    )
    .join("brands", "assets.brandId", "=", "brands.brandId")
    .where("is_active", true)
    .modify((queryBuilder) => {
      if (isRented === "0" || isRented === "1") {
        queryBuilder?.where("isRented", "=", `${isRented}`);
      }
    })
    .where("assets.name", "like", `%${name}%`)
    .then((data) => {
      res.status(200).json({
        message: "All assets fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: "Error occured while fetching assets!",
        errorMsg: error,
      });
    });
});

//Filters on assset
router.post("/filter", async (req: Request, res: Response) => {
  const {
    brands,
    screen_type,
    ram,
    status,
    assetType,
    category,
    operating_system,
    processor,
    hdd,
    connectivity,
    screen_size,
    asset_location,
    ssd,
    cable_type,
  } = req.body;
  db<Asset>("assets")
    .select(
      "assets.assetId",
      "brands.name as brandName",
      "assets.name",
      "assets.description",
      "assets.modelNo",
      "assets.status",
      "assets.asset_location",
      "assets.isRented",
      "assets.vendor",
      "assets.rent",
      "assets.deposit",
      "assets.rentStartDate",
      "assets.rentEndDate",
      "assets.processor",
      "assets.screen_type",
      "assets.ram",
      "assets.operating_system",
      "assets.screen_size",
      "assets.addedTime",
      "assets.hdd",
      "assets.category",
      "assets.connectivity",
      "assets.ssd",
      "assets.cable_type"
    )
    .join("brands", "assets.brandId", "=", "brands.brandId")
    .where("is_active", true)
    .modify((queryBuilder) => {
      // if (assetType === "hardware" || assetType === "software") {
      //   queryBuilder?.where("assetType", "=", assetType);
      // }
      if (screen_type?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          screen_type?.map((screen) => this.orWhere("screen_type", screen));
        });
      }
      if (brands?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          brands?.map((brand) => this.orWhere("brands.name", brand));
        });
      }
      if (status?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          status?.map((status) => this.orWhere("status", status));
        });
      }

      if (operating_system?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          operating_system?.map((os) => this.orWhere("operating_system", os));
        });
      }
      if (hdd?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          hdd?.map((hdd) => this.orWhere("hdd", hdd));
        });
      }
      if (ssd?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          ssd?.map((ssd) => this.orWhere("ssd", ssd));
        });
      }
      if (cable_type?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          hdd?.map((hdd) => this.orWhere("cable_type", cable_type));
        });
      }
      if (connectivity?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          connectivity?.map((connectivity) =>
            this.orWhere("connectivity", connectivity)
          );
        });
      }

      if (category?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          category?.map((categoryoptions) =>
            this.orWhere("category", categoryoptions)
          );
        });
      }

      if (processor?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          processor?.map((processoroptions) =>
            this.orWhere("processor", processoroptions)
          );
        });
      }

      if (ram?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          ram?.map((ramoptions) => this.orWhere("ram", ramoptions));
        });
      }

      if (screen_size?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          screen_size?.map((size) => this.orWhere("screen_size", size));
        });
      }

      if (asset_location?.length > 0) {
        queryBuilder?.where(function () {
          //@ts-ignore
          asset_location?.map((assetlocation) =>
            this.orWhere("asset_location", assetlocation)
          );
        });
      }
    })
    .then((data) => {
      res.status(200).json({
        message: "All assets fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: "Error occured while fetching assets!",
        errorMsg: error,
      });
    });
});

//get all details of a single asset
router.get(
  "/singleAsset/:assetId",
  isAuth,
  async (req: Request, res: Response) => {
    const { assetId } = req.params;
    if (!assetId) res.status(400).json({ error: "Asset Id is missing!" });
    db.select(
      "assets.assetId",
      "brands.name as brandName",
      "assets.name",
      "assets.description",
      "assets.modelNo",
      "assets.status",
      "assets.asset_location",
      "assets.isRented",
      "assets.vendor",
      "assets.rent",
      "assets.deposit",
      "assets.rentStartDate",
      "assets.rentEndDate",
      "assets.processor",
      "assets.screen_type",
      "assets.ram",
      "assets.operating_system",
      "assets.screen_size",
      "assets.addedTime",
      "assets.hdd",
      "assets.category",
      "assets.connectivity",
      "assets.ssd",
      "assets.cable_type"
    )
      .from("assets")
      .join("brands", "assets.brandId", "=", "brands.brandId")
      .where("assets.assetId", "=", assetId)
      .first()
      .then(async (data) => {
        if (data.status === "allocated") {
          db.select(
            "assets.assetId",
            "brands.name as brandName",
            "assets.name",
            "assets.description",
            "assets.modelNo",
            "assets.status",
            "employees.empId",
            "employees.name as empName",
            "assets.asset_location",
            "assets.isRented",
            "assets.vendor",
            "assets.rent",
            "assets.deposit",
            "assets.rentStartDate",
            "assets.rentEndDate",
            "assets.processor",
            "assets.screen_type",
            "assets.ram",
            "assets.operating_system",
            "assets.screen_size",
            "assets.addedTime",
            "assets.hdd",
            "assets.category",
            "assets.connectivity",
            "assets.ssd",
            "assets.cable_type"
          )
            .from("assets")
            .join("brands", "assets.brandId", "=", "brands.brandId")
            .join(
              "assetallocation",
              "assetallocation.assetId",
              "assets.assetId"
            )
            .join("employees", "assetallocation.empId", "employees.empId")
            .where("assets.assetId", "=", assetId)
            .first()
            .then((data) => {
              res.status(200).json({ data: data });
            })
            .catch((error) =>
              res.status(400).json({
                error: "Error occured while fetching asset details",
                errorMsg: error,
              })
            );
        } else {
          res.status(200).json({
            message: `Asset with assetId:${assetId} fetched successfully`,
            data: data,
          });
        }
      })
      .catch((error) => {
        res
          .status(400)
          .json({ error: "Error occured while fetching asset details" });
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
    "assets.description",
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
      // usability,
      processor,
      screen_type,
      ram,
      operating_system,
      screen_size,
      hdd,
      ssd,
      cable_type,
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
          status: "surplus",
          processor,
          hdd,
          ssd,
          cable_type,
          screen_type,
          ram,
          operating_system,
          screen_size,
          //usability,
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
          hdd,
          ssd,
          cable_type,
          description,
          status: "surplus",
          processor,
          screen_type,
          ram,
          operating_system,
          screen_size,
          //usability,
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
          try {
            const allAssets = results.map(async (result: any) => {
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

            const resAssets: Asset[] = await Promise.all(allAssets);

            const allocatedEmp = resAssets?.map((asset) => {
              if (asset?.status === "allocated") {
                const obj = {
                  empId: asset?.empId,
                  modelNo: asset?.modelNo,
                  allocationTime: asset?.addedTime,
                };
                return obj;
              }
            });

            const refineAssets = resAssets.map((asset) => {
              delete asset?.empId;
              return asset;
            });

            await db<Asset>("assets").insert(refineAssets as unknown as Asset);

            const data = await db<Asset>("assets").select("*");
            const allocateData = data?.filter(
              (el) => el?.status === "allocated"
            );
            const alocateinsertdata: any = [];

            allocatedEmp?.map((elobj) => {
              allocateData?.map((asset) => {
                if (asset?.modelNo === elobj?.modelNo) {
                  const allocationobj = {
                    empId: elobj?.empId,
                    assetId: asset?.assetId,
                    allocationTime: elobj?.allocationTime,
                  };
                  alocateinsertdata.push(allocationobj);
                }
              });
            });

            await db("assetallocation").insert(alocateinsertdata as any);

            res.status(200).json({ message: "Assets added Successfully!" });
          } catch (error: any) {
            if (error?.code === "ER_DUP_ENTRY") {
              res.status(400).json({
                message: "duplicate Data",
              });
            } else {
              res.status(400).json({
                error,
              });
            }
          }
        });
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }
);

//filter options
router.get("/filterOptions", async (req: Request, res: Response) => {
  const { category, status, asset_location } = req.params;
  const filter = await db
    .select("*")
    .from("filters")
    .then((data) => {
      const result = data.reduce(function (r, a) {
        r[a.filter_name] = r[a.filter_name] || [];
        r[a.filter_name].push(a.fields);
        return r;
      }, Object.create(null));

      res.status(200).json({
        message: `Filter options fetched successfully`,
        data: result,
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: "Error occured whie trying to fetch filter options!",
        errorMsg: error,
      });
    });
});

//Delete an asset
router.post("/delete/:assetId", async (req: Request, res: Response) => {
  const { assetId } = req?.params;
  db("assetallocation")
    .where("assetId", assetId)
    .del()
    .then(() => {
      db("assets")
        .where("assetId", assetId)
        .update({ status: "surplus", is_active: false })
        .then(() =>
          res.status(200).json({ message: "Asset Deleted successfully!" })
        )
        .catch((err) =>
          res.status(400).json({
            error: "An error occured while trying to edit the asset",
            errorMsg: err,
          })
        );
    })
    .catch((err) =>
      res.status(400).json({
        error: "An error occured while trying to edit the asset",
        errorMsg: err,
      })
    );
});

export default router;
