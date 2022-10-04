import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors());

import employeeRoute from "./routes/employees";
import brandsRoute from "./routes/brands";
import adminRoute from "./routes/admin";
import authRoute from "./routes/auth";
import assetRoute from "./routes/asset";
import ticketRoute from "./routes/tickets";
app.use("/api/auth", authRoute);

app.use("/api/admin", adminRoute);

app.use("/api/employees", employeeRoute);

app.use("/api/brands", brandsRoute);

app.use("/api/assets", assetRoute);
app.use("/api/tickets", ticketRoute);

module.exports.handler = serverless(app);
// app.listen(4000, () => console.log("Server started"));
