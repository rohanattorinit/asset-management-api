import express, { Request, Response } from "express";
const router = express.Router();
import db from "../config/connection";
import moment from "moment";
import { isAdmin, isAuth } from "../middleware/authorization";

router.get(
    "/logs/:assetId",
    async (req: Request, res: Response) => {
     const {assetId} = req.params;
      if(!assetId?.length){
        res.status(400).json({error: "Asset Id is missing!"})
      }
      try {
        
        const data =await db("transaction_log").select("*").where("asset_id",assetId).orderBy('date');
        res.status(200).json({
            message: `Logs fetched successfully for assetId ${assetId}`,
           data:data  
          });
      } catch (error) {
        res.status(400).json({error: "Error while fetching transaction logs!",errorMsg:error})
      }
      
    }
  );

  // Get count for pie charts
router.get("/categoryCount", async (req:Request, res: Response) => {
    try {
      
      // get total count of all categories of assets
      const totalCount = await db.select('category').from('assets').count('* as count').groupBy('category');
      
      // get total count of surplus assets 
      const surplusCount = await db.select('category').from('assets').count('* as count').groupBy('category').where('status','Surplus');
  
      res.status(200).json({
        message: `Chart category count data fetched successfully`,
        data: {totalAssetCount:totalCount,totalSurplusCount:surplusCount}
      });
      
    } catch (error) {
      res.status(400).json({error: "Error occured while fetching chart count data!",errorMsg:error})
    }
    
  });

export default router;