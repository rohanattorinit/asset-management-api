import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY!);
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
  return next();
};
