import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import db from "../config/connection";

export interface RequestCustom extends Request {
  user?: string;
}

export const isAdmin = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  try {
    const checkIsAdmin = (res: Response) => {
      const promise = new Promise((resolve, reject) => {
        db.select("*")
          .from("employees")
          .where("empId", "=", req?.user!)
          .then((data) => {
            if (!data[0]?.isAdmin) {
              res.status(401).json({
                error: "You are not authorised to access this route!",
              });
              return reject({
                error: "You are not authorised to access this route!",
              });
            } else {
              return resolve(data);
            }
          });
      });
      return promise;
    };
    const response = await checkIsAdmin(res);
  } catch (error) {
    return res.status(400).json({ error: "Error accessing the current route" });
  }
  return next();
};

export const isAuth = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const token = req.headers?.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }
  try {
    jwt.verify(token, process.env.SECRET_KEY!, (err: any, decoded: any) => {
      if (err?.name === "TokenExpiredError") {
        req.user = undefined;
        return res
          .status(403)
          .json({ message: "Token is expired! Try logging in again" });
      }
      if (decoded) {
        //@ts-ignore
        req.user = decoded?.empId;
        return next();
      }
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
