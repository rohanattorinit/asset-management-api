import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";
import { isAdmin, isAuth } from "../middleware/authorization";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import brands from "./brands";
import { Ticket } from "./tickets";
const upload = multer({ dest: "/tmp" });
import uniq from "lodash.uniqby";

interface Asset {
  assetId?: number;
  brandId: number;
  name: string;
  assetType: "software" | "hardware";
  category: string;
  modelNo: string;
  description: string;
  status: "allocated" | "surplus" | "broken" | "repairable";
  is_active?: boolean;
  processor?: string;
  screen_type?: string;
  ram?: string;
  operating_system?: string;
  screen_size?: string;
  asset_location?: string;
  allocationTime?: string;
  isRented?: boolean;
  vendor?: string;
  rent?: number;
  deposit?: number;
  rentStartDate?: string;
  rentEndDate?: string;
  received_date?: string;
  empId?: string;
  ssd?: string;
  hdd?: string;
  os_version?: string;
  imeiNo?: string;
  make_year: number;
  connectivity?: "wired" | "wireless";
  cableType?: string;
}

interface UpdateAssetType {
  name?: string;
  modelNo?: string;
  description?: string;
  status?: "allocated" | "surplus" | "broken" | "repairable";
  // usability?: 'usable' | 'unusable' | 'disposed'
  asset_location: string;
  isRented: boolean;
  vendor?: string;
  rent?: number;
  deposit?: number;
  rentStartDate?: string;
  rentEndDate?: string;
  received_date?: string;
  ram?: string;
  processor?: string;
  screen_type?: string;
  operating_system?: string;
  screen_size?: string;
  ssd?: string;
  hdd?: string;
  os_version?: string;
  imeiNo?: string;
  make_year?: number;
  connectivity?: "wired" | "wireless";
  cableType?: string;
  is_active?: boolean;
}

interface Filters {
  fieldId?: number;
  fields: string;
  filter_name: string;
}

//get all assets
router.get("/", async (req, res: Response) => {
  const { name, isRented, allocate } = req?.query;

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
      // "assets.addedTime",
      "assets.hdd",
      "assets.category",
      "assets.connectivity",
      "assets.ssd",
      "assets.cableType",
      "assets.is_active"
    )
    .join("brands", "assets.brandId", "=", "brands.brandId")
    .orderBy("assets.is_active", "desc")
    .modify((queryBuilder) => {
      if (allocate === "true") {
        queryBuilder?.where("status", `Surplus`);
      }
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

//get all details of a single asset
router.get(
  "/singleAsset/:assetId",

  async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      if (!assetId) res.status(400).json({ error: "Asset Id is missing!" });
      const tickets = await db<Ticket>("tickets")
        .select("*")
        .where("assetId", "=", assetId);
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
        "assets.category",
        "assets.ram",
        "assets.operating_system",
        "assets.screen_size",
        "assets.received_date",
        "assets.ssd",
        "assets.hdd",
        "assets.os_version",
        "assets.imeiNo",
        "assets.make_year",
        "assets.connectivity",
        "assets.cableType",
        "assets.is_active"
      )
        .from("assets")
        .join("brands", "assets.brandId", "=", "brands.brandId")
        .where("assets.assetId", "=", assetId)

        //.where('assets.is_active', true)
        .first()
        .then(async (data) => {
          if (data.status === "Allocated") {
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
              "assets.category",
              "assets.ram",
              "assets.operating_system",
              "assets.screen_size",
              "assets.received_date",
              "assets.ssd",
              "assets.hdd",
              "assets.os_version",
              "assets.imeiNo",
              "assets.make_year",
              "assets.connectivity",
              "assets.cableType",
              "assets.is_active"
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
                res
                  .status(200)
                  .json({ data: { asset: data, tickets: tickets } });
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
              data: { asset: data, tickets: tickets },
            });
          }
        });
    } catch (error) {
      res
        .status(400)
        .json({ error: "Error occured while fetching asset details" });
    }
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
    "assetallocation.allocationTime",
    "assets.description"
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
      processor,
      screen_type,
      ram,
      operating_system,
      screen_size,
      hdd,
      ssd,
      cableType,
      isRented,
      asset_location,
      vendor,
      rent,
      deposit,
      rentStartDate,
      rentEndDate,
      received_date,
      empId,

      os_version,
      imeiNo,
      make_year,
      connectivity,

      allocationTime,
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
          processor,

          screen_type,
          ram,
          screen_size,
          operating_system,
          asset_location,
          // addedTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          isRented,
          vendor,
          rent,
          deposit,
          rentStartDate,
          rentEndDate,
          received_date,
          ssd,
          hdd,
          os_version,
          imeiNo,
          make_year,
          connectivity,
          cableType,
        }
      : {
          brandId,
          name: assetName,
          assetType,
          category,
          modelNo,
          isRented,

          description,
          received_date,
          status,
          processor,
          screen_type,
          ram,
          screen_size,
          operating_system,
          asset_location,
          // addedTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          ssd,
          hdd,
          os_version,
          imeiNo,
          make_year,
          connectivity,
          cableType,
        };
    if (empId) {
      await db<Asset>("assets").insert(asset);
      const id = await db
        .select("assetId")
        .from("assets")
        .where("modelNo", modelNo)
        .first();

      const allocateObj = {
        empId: empId,
        assetId: id?.assetId,
        allocationtime: allocationTime,
      };
      await db("assetallocation").insert(allocateObj);
    } else {
      await db<Asset>("assets").insert(asset);
    }

    res.status(200).json({
      message: "Asset created successfully",
    });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      res.status(400).json({
        error: "Duplicate asset data",
        errorMsg: error,
      });
    } else {
      res.status(400).json({
        error,
      });
    }
  }
});

const exists = async (key: string, value: any) => {
  try {
    if (key === "empId") {
      const res = await db.first(
        db.raw(
          "exists ? as present",
          db("employees").select(`${key}`).where(`${key}`, "=", value).limit(1)
        )
      );
      return res.present === 1;
    } else if (key === "modelNo") {
      const res = await db.first(
        db.raw(
          "exists ? as present",
          db("assets").select(`${key}`).where(`${key}`, "=", value).limit(1)
        )
      );
      return res.present === 0;
    } else {
      return false;
    }
  } catch (err) {
    throw new Error(`error while validating empId and ModelNo`);
  }
};
//add bulk assets
router.post(
  "/create-bulk",
  isAuth,
  isAdmin,
  upload.single("csvFile"),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results: Asset[] = [];
      fs.createReadStream(req.file?.path!)
        .pipe(csv())
        .on("data", (data: Asset) => results?.push(data))
        .on("end", async () => {
          try {
            if (results?.length === 0) {
              throw new Error(`csv file is empty please check csv file data`);
            } else {
              const allAssets = results?.map(async (result: any) => {
                let filterOptions = await db("filters")
                  .select("fields", "filter_name")
                  .join(
                    "filtercategories",
                    "filtercategories.filter_categories_id",
                    "filters.filter_categories_id"
                  )
                  .modify((queryBuilder) => {
                    queryBuilder?.where(function () {
                      this.orWhere("filtercategories.categories", "other");
                      if (typeof result?.category === "string") {
                        //@ts-ignore
                        this.orWhere("filtercategories.categories", result?.category);
                      } 
                    })
                  }).orderBy('filtercategories.categories','desc')
    
                    const filterr = filterOptions?.reduce(function (r:any, a:any) {
                      r[a.filter_name] = r[a.filter_name] || [];
                      r[a.filter_name].push(a.fields);
                      return r;
                    }, Object.create(null));
              
  
                    const requiredColumns: string[] = Object.keys(filterr)?.map((key:string)=>{
                      return key.toLowerCase()
                    })
                    const requiredFields = [...requiredColumns, "description", "name", "assetType", "modelNo", "make_year", "received_date" ]
                    if(result?.category.toLowerCase() === "mobile") requiredFields?.push("imeiNo")
                    
                     if(result?.category.toLowerCase() === "mobile"||result?.category.toLowerCase() === "laptop" || result?.category.toLowerCase() === "watch"){
                      requiredFields?.push("os_version")
                     }
                    requiredFields?.map(item => {
                      // @ts-ignore                          
                      if(!result[item]?.length > 0) {                      
                        throw new Error( `"${result?.name}" asset doesn't have a required field " ${item}"`)
                      }                  
                      })

                      const dataFields = Object.keys(result)
                      const rentedKeys = ["vendor","rent","deposit", "rentStartDate", "rentEndDate", "empId", "allocationTime", "brandName" , "isRented"]   
                      const dateKeys = ["rentStartDate", "rentEndDate", "allocationTime", "received_date"]
                      const  dateIsValid = (dateStr: string)=> {
                        const regex = /^\d{4}-\d{2}-\d{2}$/;
                      
                        if (dateStr.match(regex) === null) {
                          return false;
                        }
                      
                        const date = new Date(dateStr);
                      
                        const timestamp = date.getTime();
                      
                        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
                          return false;
                        }
                      
                        return date.toISOString().startsWith(dateStr);
                      }
                      dataFields?.map(item => {
                         // @ts-ignore
                         const value = result[item]
                         if(value !== '' && dateKeys.includes(item)){
                           if(!dateIsValid(value)){
                             throw new Error( `"${result?.name}" asset doesn't have a valid format ${value} of date `)
                           }
                         } else if(item === "isRented" && value === 0){
                          delete result?.vendor
                          delete result?.rent
                          delete result?.deposit
                          delete result?.rentStartDate
                          delete result?.rentEndDate
                        } else if(!requiredFields?.includes(item) && !rentedKeys?.includes(item) ){
                          // @ts-ignore
                          delete result[item] 
                        }
                      })
                      ///// brandcheck
                    const brand = await db("brands")
                    .select("brandId")
                    .where("name", "=", result?.brandName)
                    if(!brand[0]?.brandId){
                     throw new Error( `Brand: ${result?.brandName} doesn't exist!`)
                   }
                      delete result["brandName"];
                      result.brandId = brand[0]?.brandId;
                     if(filterr?.status.includes(result?.status) && result?.status.toLowerCase() === "allocated"){
                         const exist = await exists("empId" ,result?.empId)
                           if(!exist) {
                             throw new Error( `"${result?.name}" asset doesn't have a valid Employee Id`)
                         }
                      }
                      return result;

            });
            //////////////////////////////////////////////////
            const resAssets: Asset[] = await Promise.all(allAssets)
              const allocatedEmp = resAssets?.map((asset) => {
                if (asset?.status.toLowerCase() === "allocated") {
                  const obj = {
                    empId: asset?.empId,
                    modelNo: asset?.modelNo,
                    allocationTime: asset?.allocationTime,
                  };
                  return obj;
                }
              });
              const refineAssets = resAssets?.map((asset) => {
                const dataFields = Object.keys(asset);
                dataFields?.map((item) => {
                  // @ts-ignore
                  if (asset[item].length === 0) {
                    // @ts-ignore
                    delete asset[item];
                  }
                });
                delete asset?.empId;
                delete asset?.allocationTime;
                return asset;
              });
              /////// asset allocation
              await db<Asset>("assets").insert(
                refineAssets as unknown as Asset
              );
              const insertedAssets = await db<Asset>("assets").select("*");
              const allocateData = insertedAssets?.filter(
                (el) => el?.status.toLowerCase() === "allocated"
              );
              const allocateinsertdata: any = [];
              allocatedEmp?.map((elobj) => {
                allocateData?.map((asset) => {
                  if (asset?.modelNo === elobj?.modelNo) {
                    const allocationobj = {
                      empId: elobj?.empId,
                      assetId: asset?.assetId,
                      allocationTime: elobj?.allocationTime,
                    };
                    allocateinsertdata.push(allocationobj);
                  }
                });
              });
              if (allocateinsertdata?.length !== 0) {
                await db("assetallocation").insert(allocateinsertdata as any);
                res.status(201).json({
                  message: "Asset created successfully",
                });
                next();
              } else {
                res.status(201).json({
                  message: "Asset created successfully",
                });
                next();
              }
            }
          } catch (error: any) {
            if (error?.code === "ER_DUP_ENTRY") {
              res.status(400).json({
                error: "duplicate Data",
                errorMsg: error,
              })
            } else if(error?.toString().includes('asset')){
              res.status(400).json({
                error: `${error}`,
                errorMsg: error
              })
            } else  if(error?.toString().includes('csv')){
              res.status(400).json({
                error: `${error}`,
                errorMsg: error,
              });
            } else {
              res
                .status(400)
                .json({
                  error: "Error while creating adding assets",
                  errorMsg: error,
                });
            }
          }
        });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: "Error while creating adding assets", errorMsg: error });
    }
  }
);

//update assets
router.post("/update/:id", isAuth, async (req: Request, res: Response) => {
  const {
    assetName,
    modelNo,
    description,
    status,
    //usability,
    brandName,
    isRented,
    vendor,
    rent,
    deposit,
    rentStartDate,
    rentEndDate,
    asset_location,
    ram,
    processor,
    screen_type,
    operating_system,
    screen_size,
    received_date,
    ssd,
    hdd,
    os_version,
    imeiNo,
    make_year,
    connectivity,
    cableType,

    //rentEndDate
    //received_date
  } = req.body;
  const { id } = req.params;

  const asset: UpdateAssetType = {
    name: assetName,
    modelNo,
    description,
    status,
    //usability,
    isRented,
    vendor,
    rent,
    asset_location,
    deposit,
    rentStartDate,
    rentEndDate,
    received_date,
    ram,
    processor,
    screen_type,
    operating_system,
    screen_size,
    ssd,
    hdd,
    os_version,
    imeiNo,
    make_year,
    connectivity,
    cableType,
  };

  try {
    db<Asset>("assets")
      .where("assetId", id)
      .update(asset)
      .then((data) => {
        if (brandName) {
          db("brands")
            .select("brandId")
            .where("name", brandName)
            .first()
            .then((data) => {
              db<Asset>("assets")
                .update({ brandId: data.brandId })
                .where("assetId", id)
                .catch((err) =>
                  res.status(400).json({
                    error:
                      "Error occured while updating Brand Name of the asset",
                    errorMsg: err,
                  })
                );
            })
            .catch((err) =>
              res.status(400).json({
                error: "Error occured while updating Brand Name of the asset",
                errorMsg: err,
              })
            );
        }
        res.status(200).json({ message: "Asset Updated successfully!" });
      })
      .catch((error) => {
        res.status(400).json({
          error: "An error occured while trying to edit the asset",
          errorMsg: error,
        });
      });
  } catch (error) {
    res.status(400).json({
      error: "An error occured while trying to edit the asset",
      errorMsg: error,
    });
  }
});

router.post("/delete/:assetId", async (req: Request, res: Response) => {
  const { assetId } = req?.params;
  db("assetallocation")
    .where("assetId", assetId)
    .del()
    .then(() => {
      db("assets")
        .where("assetId", assetId)
        .update({ is_active: false, status: "broken" })
        .then(() =>
          res.status(200).json({ message: "Asset Deleted successfully!" })
        )
        .catch((err) =>
          res.status(400).json({
            error: "An error occured while trying to delete the asset",
            errorMsg: err,
          })
        );
    })
    .catch((err) =>
      res.status(400).json({
        error: "An error occured while trying to delete the asset",
        errorMsg: err,
      })
    );
});

//Filters on assset
router.post("/filter", async (req: Request, res: Response) => {
  const { name, isRented, allocate } = req?.query;
  const {
    brandName,
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
    cableType,
  } = req.body;
  try {
    const data = await db<Asset>("assets")
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
        // "assets.addedTime",
        "assets.hdd",
        "assets.category",
        "assets.connectivity",
        "assets.ssd",
        "assets.cableType",
        "assets.is_active"
      )
      .join("brands", "assets.brandId", "=", "brands.brandId")
      .orderBy("assets.is_active", "desc")
      // .where("is_active", true)
      .modify((queryBuilder) => {
        if (allocate === "true") {
          queryBuilder?.where("status", `surplus`);
        }
        if (isRented === "0" || isRented === "1") {
          queryBuilder?.where("isRented", "=", `${isRented}`);
        }

        // if (assetType === "hardware" || assetType === "software") {
        //   queryBuilder?.where("assetType", "=", assetType);
        // }
        if (screen_type?.length > 0) {
          queryBuilder?.where(function () {
            //@ts-ignore
            screen_type?.map((screen) => this.orWhere("screen_type", screen));
          });
        }
        if (brandName?.length > 0) {
          queryBuilder?.where(function () {
            //@ts-ignore
            brandName?.map((brand) => this.orWhere("brands.name", brand));
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
            operating_system?.map((operating_system) =>
              this.orWhere("operating_system", operating_system)
            );
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
        if (cableType?.length > 0) {
          queryBuilder?.where(function () {
            //@ts-ignore
            hdd?.map((hdd) => this.orWhere("cableType", cableType));
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
            category?.map((categoryoptions) => {
              this.orWhere("category", categoryoptions);
            });
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
            asset_location?.map((assetlocation) => {
              this.orWhere("asset_location", assetlocation);
            });
          });
        }
      })
      .where("assets.name", "like", `%${name}%`);

    //send filtered assets in response
    res.status(200).json({
      message: "All assets fetched successfully",
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      error: "Error occured while fetching assets!",
      errorMsg: error,
    });
  }
});

//filter options
router.get("/filterOptions/", async (req: Request, res: Response) => {
  const { category, status, asset_location } = req.query;

  try {
    // condition for all filteroptions
    //@ts-ignore
    if (!category) {
      // get all brands whose category is mobile
      let brands = await db("brands")
        .select("name as brandName")
        .orderBy("name");

      //get unique brands
      brands = uniq(brands, "brandName");

      let filterOptions = await db("filters").select("fields", "filter_name");

      //eliminate duplicate filter options
      filterOptions = uniq(filterOptions, "fields");

      const brandsArr = brands?.map((brand) => {
        return { fields: brand.brandName, filter_name: "brandName" };
      });

      filterOptions = [...filterOptions, ...brandsArr];

      const result = filterOptions?.reduce(function (r, a) {
        r[a.filter_name] = r[a.filter_name] || [];
        r[a.filter_name].push(a.fields);
        return r;
      }, Object.create(null));

      res.status(200).json({
        message: `Filter options fetched successfully`,
        data: result,
      });
    } else {
      // get all brands whose category is mobile
      const brands = await db("brands")
        .select("name as brandName")
        .join(
          "filtercategories",
          "filtercategories.filter_categories_id",
          "brands.filter_categories_id"
        )
        .modify((queryBuilder) => {
          queryBuilder?.where(function () {
            if (typeof category === "string") {
              //@ts-ignore
              this.orWhere("filtercategories.categories", category);
            } else {
              //@ts-ignore
              category?.map((category) =>
                this.orWhere("filtercategories.categories", category)
              );
            }
          });
        });

      let filterOptions = await db("filters")
        .select("fields", "filter_name")
        .join(
          "filtercategories",
          "filtercategories.filter_categories_id",
          "filters.filter_categories_id"
        )
        .modify((queryBuilder) => {
          queryBuilder?.where(function () {
            this.orWhere("filtercategories.categories", "other");
            if (typeof category === "string") {
              //@ts-ignore
              this.orWhere("filtercategories.categories", category);
            } else {
              //@ts-ignore
              category?.map((category) =>
                this.orWhere("filtercategories.categories", category)
              );
            }
          });
        })
        .orderBy("filtercategories.filter_categories_id", "desc");

      const brandsArr = brands?.map((brand: any) => {
        return { fields: brand?.brandName, filter_name: "brandName" };
      });

      filterOptions = [...filterOptions, ...brandsArr];

      //@ts-ignore
      const result = filterOptions?.reduce(function (r, a) {
        r[a.filter_name] = r[a.filter_name] || [];
        r[a.filter_name].push(a.fields);
        return r;
      }, Object.create(null));

      res.status(200).json({
        message: `Filter options fetched successfully`,
        data: result,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Error occured whie trying to fetch filter options!",
      errorMsg: error,
    });
  }
});

export default router;
