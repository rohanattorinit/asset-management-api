const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const employeeRoute = require("./routes/employees");

app.use("/api/employees", employeeRoute);

app.listen(4000, () => {
  console.log("App is running in port: 4000");
});
