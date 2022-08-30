const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const employeeRoute = require("./routes/employees");
const brandsRoute = require("./routes/brands");
const adminRoute = require("./routes/admin");
const authRoute = require("./routes/auth");

app.use("/api/auth", authRoute);

app.use("/api/admin", adminRoute);

app.use("/api/employees", employeeRoute);

app.use("/api/brands", brandsRoute);

app.listen(4000, () => {
  console.log("App is running in port: 4000");
});
