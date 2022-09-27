import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";
import { isAdmin, isAuth } from "../middleware/authorization";
import multer from "multer";
const upload = multer({
  dest: "/uploads",
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "text/csv") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .csv files are allowed!"));
    }
  },
});

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
router.get("/", isAuth, async (_, res: Response) => {
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
      )
      .catch((error) =>
        res.status(400).json({ error: "Error occured while creating asset" })
      );
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post(
  "/create-bulk",
  isAuth,
  isAdmin,
  upload.single("csvFile"),
  async (req: Request, res: Response) => {
    //validate size and type of file

    //retrieve brandId for each record
    //find current time for each record

    try {
      const results: EmployeeType[] = [];
      fs.createReadStream(req.file?.path!)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          const employees = results.map(async (result: EmployeeType) => {
            const hash = await generateHash(result.email);
            result.password = hash;
            return result;
          });

          Promise.all(employees).then((results) => {
            db<EmployeeType>("employees")
              .insert(results as unknown as EmployeeType)
              .then(() => {
                res
                  .status(200)
                  .json({ message: "Employee added Successfully!" });
              });
          });
        });
    } catch (error) {
      res.status(400).json({ error: "Error while creating adding employees" });
    }
  }
);
export default router;
