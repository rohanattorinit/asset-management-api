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
        // Get data from asset_update table and store the array in a constant 
        const asset_updation_logs = await db('asset_update').select("asset_update_id","updated_feature","description","effective_date as updated_at")
                                .where('asset_id',assetId)
                                
        const ticket_logs = await db('tickets').join('employees','employees.empId','tickets.empId').select("employees.empId","employees.name as empName","tickets.ticketId","tickets.createdAt as created_at","tickets.closedAt as closed_at")
                                .where('assetId',assetId)

        const allocation_logs = await db('transaction_history').select("emp_id","emp_name","allocation_date as allocated_at","deallocation_date as deallocated_at")
                                .where('asset_id',assetId)
        const {received_at,deleted_at} = await db('assets').select("received_date as received_at","deleted_at").where('assetId',assetId).first()
        const response = {
            asset_updation_logs: asset_updation_logs,
            ticket_logs:ticket_logs,
            allocation_logs:allocation_logs,
            received_at:received_at,
            deleted_at:deleted_at
        }
        res.status(200).json({
            message: `Logs fetched successfully for assetId ${assetId}`,
            data: response,
          });
      } catch (error) {
        res.status(400).json({error: "Error while fetching transaction logs!",errorMsg:error})
      }
      
    }
  );

export default router;