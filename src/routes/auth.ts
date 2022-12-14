import express, { Request, Response } from 'express'
const router = express.Router()
import db from '../config/connection'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { isAuth, RequestCustom } from '../middleware/authorization'
interface EmployeeType {
  empId: string
  name: string
  email: string
  phone: number
  password: string
  location: string
  isAdmin: boolean
  jobTitle: string
  is_active?: boolean
}

//login
router.post('/', async (req: RequestCustom, res: Response) => {
  const { email, password } = req.body
  if (!email || !password)
    res.status(400).json({ error: 'Email or Password missing' })
  try {
    db<EmployeeType>('employees')
      .select('*')
      .where('email', '=', email)
      .then(async data => {
        if (!data[0]?.is_active) {
          return res.status(400).json({ error: 'Employee does not exist!' })
        }
        const isValid = await bcrypt.compare(password, data[0].password)
        if (isValid) {
          const options = {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
            httpOnly: true
          }
          db('tokens')
            .select('*')
            .where('emp_id', '=', data[0].empId)
            .then(tokenData => {
              if (tokenData[0]) {
                jwt.verify(
                  tokenData[0]?.token,
                  process.env.SECRET_KEY!,
                  (err: any, decoded: any) => {
                    if (err?.name === 'TokenExpiredError') {
                      //create new token and update in db and send to client
                      const newToken = jwt.sign(
                        { empId: data[0]?.empId },
                        process.env.SECRET_KEY!,
                        {
                          expiresIn: '2h'
                        }
                      )
                      const tokenUpdatedObj = {
                        token: newToken,
                        emp_id: data[0].empId
                      }
                      db('tokens')
                        .update({ token: newToken })
                        .where('emp_id', tokenUpdatedObj?.emp_id)
                        .then(() => {
                          const userData = {
                            empId: data[0]?.empId,
                            name: data[0]?.name,
                            email: data[0]?.email,
                            phone: data[0]?.phone,
                            location: data[0]?.location,
                            isAdmin: data[0]?.isAdmin,
                            jobTitle: data[0]?.jobTitle
                          }
                          req.user = data[0]?.empId
                          res
                            .status(200)
                            .cookie('token', newToken, options)
                            .json({
                              message: 'Logged in Successfully!',
                              token: newToken,
                              user: userData
                            })
                        })
                    } else {
                      //@ts-ignore
                      req.user = decoded?.empId
                      res.status(400).json({
                        error: 'Please Logout from Other Devices & Try Again!!'
                      })
                    }
                  }
                )
              } else {
                //create token and insert in DB
                const token = jwt.sign(
                  { empId: data[0]?.empId },
                  process.env.SECRET_KEY!,
                  {
                    expiresIn: '2h'
                  }
                )
                const tokenObj = {
                  token,
                  emp_id: data[0].empId
                }
                db('tokens')
                  .insert(tokenObj)
                  .then(() => {
                    const userData = {
                      empId: data[0]?.empId,
                      name: data[0]?.name,
                      email: data[0]?.email,
                      phone: data[0]?.phone,
                      location: data[0]?.location,
                      isAdmin: data[0]?.isAdmin,
                      jobTitle: data[0]?.jobTitle
                    }
                    req.user = data[0].empId
                    res.status(200).cookie('token', token, options).json({
                      message: 'Logged in Successfully!',
                      token,
                      user: userData
                    })
                  })
              }
            })
        } else {
          res.status(400).json({ error: 'Wrong credentials!' })
        }
      })
  } catch (error) {
    res.status(400).json({ error: 'Error occured while logging in' })
  }
})

//change password
router.post(
  '/changePassword/',
  isAuth,
  async (req: RequestCustom, res: Response) => {
    const { password } = req.body
    const userId = req.user
    if (!userId || !password)
      res.status(400).json({ error: 'Password or Id is missing' })
    const hash = await bcrypt.hash(password, 10)
    db('employees')
      .where('empId', userId)
      .update({ password: hash })
      .then(() => {
        res.status(200).json({ message: 'Password Changed Successfully!' })
      })
      .catch(error =>
        res.status(400).json({
          error: 'Error occured while changing password!',
          errorMsg: error
        })
      )
  }
)

//delete a user
router.post('/logout/', isAuth, async (req: RequestCustom, res: Response) => {
  db('tokens')
    .where('emp_id', req.user)
    .del()
    .then(() => {
      req.user = undefined
      res.status(200).json({ message: 'Logged out Successfully!' })
    })
    .catch(error =>
      res
        .status(400)
        .json({ error: 'Error occured while logging out!', errorMsg: error })
    )
})

//Get user profile
router.get('/profile', isAuth, async (req: RequestCustom, res: Response) => {
  const userId = req.user
  db.select('*')
    .from('employees')
    .where('empId', '=', userId!)
    .then(data => {
      if (data[0]) {
        const user = {
          empId: data[0]?.empId,
          name: data[0]?.name,
          email: data[0]?.email,
          phone: data[0]?.phone,
          location: data[0]?.location,
          isAdmin: data[0]?.isAdmin,
          jobTitle: data[0]?.jobTitle
        }
        res.status(200).json({ user: user })
      } else {
        res.status(400).json({ error: 'Employee not found!' })
      }
    })
    .catch(error => res.status(400).json({ error }))
})
export default router
