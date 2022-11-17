import express, { Request, Response } from 'express'
const router = express.Router()
import db from '../config/connection'
import moment from 'moment'
import { isAdmin, isAuth } from '../middleware/authorization'
import multer from 'multer'
import fs from 'fs'
import csv from 'csv-parser'
const upload = multer({ dest: '/tmp' })

interface Asset {
  assetId?: number
  brandId: number
  name: string
  assetType: 'software' | 'hardware'
  category: string
  modelNo: string
  description: string
  status: 'allocated' | 'surplus' | 'broken' | 'repairable'
  //usability: "usable" | "unusable" | "disposed";
  is_active?: boolean
  processor?: string
  screen_type?: string
  ram?: string
  operating_system?: string
  screen_size?: string
  asset_location?: string
  addedTime?: string
  isRented?: boolean
  vendor?: string
  rent?: number
  deposit?: number
  rentStartDate?: string
  rentEndDate?: string
  received_date?: string
  empId?: string
  ssd?: string
  hdd?: string
  os_version?:string
  imeiNo?: string
  make_year:number
  connectivity?: 'wired' | 'wireless'
  cableType?: string
}

interface UpdateAssetType {
  name?: string
  modelNo?: string
  description?: string
  status?: 'allocated' | 'surplus' | 'broken' | 'repairable'
  // usability?: 'usable' | 'unusable' | 'disposed'
  asset_location: string
  isRented: boolean
  vendor?: string
  rent?: number
  deposit?: number
  rentStartDate?: string
  rentEndDate?: string
  received_date?: string
  ram?: string
  processor?: string
  screen_type?: string
  operating_system?: string
  screen_size?: string
  ssd?: string
  hdd?: string
  os_version?: string
  imeiNo?: string
  make_year?:number
  connectivity?:'wired' | 'wireless'
  cableType?: string
}

interface Filters {
  fieldId?: number
  fields: string
  filter_name: string
}

//get all assets
router.get('/', isAuth, isAdmin, async (req, res: Response) => {
  const {
    name,
    allocate,
    assetType,
    isRented,
 
    operating_system,
    processor
  } = req?.query
  const { screen_type } = req.body
  db<Asset>('assets')
    .select('*')
    .where('is_active', true)
    .modify(queryBuilder => {
      if (allocate === 'true') {
        queryBuilder?.where('status', `surplus`)
      }
      if (isRented === '0' || isRented === '1') {
        queryBuilder?.where('isRented', '=', `${isRented}`)
      }
      if (assetType === 'hardware' || assetType === 'software') {
        queryBuilder?.where('assetType', '=', assetType)
      }
      if (screen_type && screen_type !== 'undefined') {
        queryBuilder?.where('screen_type', '=', screen_type)
      }
      if (operating_system && operating_system !== 'undefined') {
        //console.log('data=>', operating_system)
        queryBuilder?.where('operating_system', '=', operating_system)
      }
      
      if (processor && processor !== 'undefined') {
        queryBuilder?.where('processor', '=', processor)
      }
    })
    .where('name', 'like', `%${name}%`)
    .then(data => {
      // console.log(data)
      
      res.status(200).json({
        message: 'All assets fetched successfully',
        data: data
      })
    })
    .catch(error => {
      res.status(400).json({
        error: 'Error occured while fetching assets!',
        errorMsg: error
      })
    })
})

//get all details of a single asset
router.get(
  '/singleAsset/:assetId',

    async (req: Request, res: Response) => {
    const { assetId } = req.params
    if (!assetId) res.status(400).json({ error: 'Asset Id is missing!' })

    db.select(
      'assets.assetId',
      'brands.name as brandName',
      'assets.name',
      'assets.description',
      'assets.modelNo',
      'assets.status',
      'assets.asset_location',
      'assets.isRented',
      'assets.vendor',
      'assets.rent',
      'assets.deposit',
      'assets.rentStartDate',
      'assets.rentEndDate',
      'assets.processor',
      'assets.screen_type',
      'assets.category',
      'assets.ram',
      'assets.operating_system',
      'assets.screen_size',
      'assets.received_date',
      'assets.ssd',
      'assets.hdd',
      'assets.os_version',
      'assets.imeiNo',
      'assets.make_year',
      'assets.connectivity',
      'assets.cableType'

     
      
    )
      .from('assets')
      .join('brands', 'assets.brandId', '=', 'brands.brandId')
      .where('assets.assetId', '=', assetId)
      .where('assets.is_active', true)
      .first()
      .then(async data => {
        if (data.status === 'allocated') {
          db.select(
            'assets.assetId',
            'brands.name as brandName',
            'assets.name',
            'assets.description',
            'assets.modelNo',
            'assets.status',
            //"assets.usability",
            'employees.empId',
            'employees.name as empName',
            'assets.asset_location',
            'assets.isRented',
            'assets.vendor',
            'assets.rent',
            'assets.deposit',
            'assets.rentStartDate',
            'assets.rentEndDate',
            'assets.processor',
            'assets.screen_type',
            'assets.category',
            'assets.ram',
            'assets.operating_system',
            'assets.screen_size',
            'assets.received_date',
            'assets.ssd',
      'assets.hdd',
      'assets.os_version',
      'assets.imeiNo',
      'assets.make_year',
      'assets.connectivity',
      'assets.cableType'
          )
            .from('assets')
            .join('brands', 'assets.brandId', '=', 'brands.brandId')
            .join(
              'assetallocation',
              'assetallocation.assetId',
              'assets.assetId'
            )
            .join('employees', 'assetallocation.empId', 'employees.empId')
            .where('assets.assetId', '=', assetId)
            .first()
            .then(data => {
              console.log(data?.received_date)
              res.status(200).json({ data: data })
            })
            .catch(error =>
              res.status(400).json({
                error: 'Error occured while fetching asset details',
                errorMsg: error
              })
            )
        } else {
          console.log({data})
          res.status(200).json({
            message: `Asset with assetId:${assetId} fetched successfully`,
            data: data
          })
        }
      })
      .catch(error => {
        res
          .status(400)
          .json({ error: 'Error occured while fetching asset details' })
      })
  }
)

//get all assets of a single employee
router.get('/employeeAssets/:empId', isAuth, async (req, res) => {
  const { empId } = req.params
  db.select(
    'assets.assetId',
    'assets.name',
    'assets.modelno',
    'assets.category',
    'assetallocation.allocationTime'
  )
    .from('assetallocation')
    .join('assets', 'assetallocation.assetId', '=', 'assets.assetId')
    .join('brands', 'assets.brandId', '=', 'brands.brandid')
    .where('assetallocation.empId', empId)
    .then(data => {
      res.status(200).json({
        message: `All assets fetched for employee: ${empId} successfully`,
        data: data
      })
    })
    .catch(error => {
      res.status(400).json({ error })
    })
})

//create a new asset
router.post('/addAsset', isAuth, isAdmin, async (req, res) => {
  
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
      isRented,
      asset_location,
      vendor,
      rent,
      deposit,
      rentStartDate,
      rentEndDate,
      received_date,
      empId,
      ssd,
      hdd,
      os_version,
      imeiNo,
      make_year,
      connectivity,
      cableType


    } = req.body
   
    
    if (isRented) {
      
      if (!vendor || !deposit || !rentStartDate || !rentEndDate) {
        return res.status(400).json({ error: 'Please provide rental details!' })
      }
    }
    //find brand Id using the brand name given in request body
    const brandArr = await db('brands')
      .select('brandId')
      .where('name', '=', brandName)
    const brandId = brandArr[0].brandId
    
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
          addedTime: moment().format('YYYY-MM-DD HH:mm:ss'),
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
          cableType
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
          addedTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          ssd,
          hdd,
          os_version,
          imeiNo,
          make_year,
          connectivity,
          cableType
        }
        if(empId) {
          
        await db<Asset>('assets').insert(asset)
        const id = await db
      .select('assetId')
      .from('assets')
      .where('modelNo', modelNo)
      .first()

   

    const allocateObj = {
      empId: empId,
      assetId: id?.assetId,
      allocationtime: asset?.addedTime
    }

    await db('assetallocation').insert(allocateObj)
  } else {
    await db<Asset>('assets').insert(asset)
  }

    res.status(200).json({
      message: 'Asset created successfully'
    })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        error: 'Duplicate asset data',
        errorMsg: error,
      })
    } else {
      console.log(error)
      res.status(400).json({
        error
      })
    }
  }
})

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
          try{
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
            const resAssets: Asset[] = await Promise.all(allAssets)
            
              const allocatedEmp = resAssets?.map((asset) => {
                if(asset?.status === "allocated"){
                  const obj = {
                    empId: asset?.empId,
                    modelNo: asset?.modelNo,
                    allocationTime: asset?.addedTime
                  }
                  return obj
                }
              })
             const refineAssets =  resAssets.map((asset) => {
                  delete asset?.empId
                  return asset
              })
            
            if(allocatedEmp[0]?.empId){

            await db<Asset>("assets").insert(refineAssets as unknown as Asset)
            const data = await  db<Asset>("assets").select("*")
            const allocateData = data?.filter((el) => el?.status === "allocated")
            const alocateinsertdata: any = [];
            
            allocatedEmp?.map((elobj) =>{
               allocateData?.map((asset) =>{
                if(asset?.modelNo === elobj?.modelNo){
                  const allocationobj= {
                    empId: elobj?.empId,
                    assetId: asset?.assetId,
                    allocationTime: elobj?.allocationTime
                  }
                  alocateinsertdata.push(allocationobj)
                }
              })
            })
              await db("assetallocation").insert(alocateinsertdata as any)
              res.status(200).json({ message: "Assets added Successfully!" })
            } else{
              await db<Asset>('assets')
              .insert((refineAssets as unknown) as Asset)
              
                res.status(200).json({ message: 'Assets added Successfully!' })
              
            }
          } catch(error: any){
            if(error?.code === "ER_DUP_ENTRY" ){
              res.status(400).json({
                error : "duplicate Data",
                errorMsg: error,
              })
            } else {
              console.log({error})
              res.status(400).json({
                error
              })
            }
          }
        });
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }
);

//update assets
router.post('/update/:id', isAuth, async (req: Request, res: Response) => {
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
    cableType

    //rentEndDate
    //received_date
  } = req.body
  const { id } = req.params

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
    cableType
  }

  try {
    db<Asset>('assets')
      .where('assetId', id)
      .update(asset)
      .then(data => {
        if (brandName) {
          db('brands')
            .select('brandId')
            .where('name', brandName)
            .first()
            .then(data => {
              db<Asset>('assets')
                .update({ brandId: data.brandId })
                .where('assetId', id)
                .catch(err =>
                  res.status(400).json({
                    error:
                      'Error occured while updating Brand Name of the asset',
                    errorMsg: err
                  })
                )
            })
            .catch(err =>
              res.status(400).json({
                error: 'Error occured while updating Brand Name of the asset',
                errorMsg: err
              })
            )
        }
        res.status(200).json({ message: 'Asset Updated successfully!' })
      })
      .catch(error => {
        res.status(400).json({
          error: 'An error occured while trying to edit the asset',
          errorMsg: error
        })
      })
  } catch (error) {
    res.status(400).json({
      error: 'An error occured while trying to edit the asset',
      errorMsg: error
    })
  }
})

router.get('/filterOptions', async (_, res: Response) => {
  db.select('*')
    .from('filters')
    .then(data => {
      const result = data.reduce(function (r, a) {
        r[a.filter_name] = r[a.filter_name] || []
        r[a.filter_name].push(a.fields)
        return r
      }, Object.create(null))

      res.status(200).json({
        message: `Filter options fetched successfully`,
        data: result
      })
    })
    .catch(error => {
      res.status(400).json({
        error: 'Error occured whie trying to fetch filter options!',
        errorMsg: error
      })
    })
})

router.post('/delete/:assetId', async (req: Request, res: Response) => {
  const { assetId } = req?.params
  db('assetallocation')
    .where('assetId', assetId)
    .del()
    .then(() => {
      db('assets')
        .where('assetId', assetId)
        .update({ is_active: false })
        .then(() =>
          res.status(200).json({ message: 'Asset Deleted successfully!' })
        )
        .catch(err =>
          res.status(400).json({
            error: 'An error occured while trying to delete the asset',
            errorMsg: err
          })
        )
    })
    .catch(err =>
      res.status(400).json({
        error: 'An error occured while trying to delete the asset',
        errorMsg: err
      })
    )
})

export default router
