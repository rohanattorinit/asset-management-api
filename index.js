const express = require("express");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.listen(4000, () => {
  console.log("Asset App is running in port: 4000");
});
