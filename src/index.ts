import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

import employeeRoute from "./routes/employees";
import brandsRoute from "./routes/brands";
import adminRoute from "./routes/admin";
import authRoute from "./routes/auth";
import assetRoute from "./routes/asset";

app.use("/api/auth", authRoute);

app.use("/api/admin", adminRoute);

app.use("/api/employees", employeeRoute);

app.use("/api/brands", brandsRoute);

app.use("/api/assets", assetRoute);

app.listen(port, (): void => {
  console.log(`Server is running here ⚡ : [http://localhost:${port}]`);
});
