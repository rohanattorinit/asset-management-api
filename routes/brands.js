const express = require("express");
const router = express.Router();
const { db } = require("../config/connection");

//add new brand
router.post("/", async (req, res) => {
  db("brands")
    .insert({
      name: req.body.name,
    })
    .then(() => {
      res.status(200).json({ message: "Brand Added Successfull!" });
    })
    .catch((error) => res.status(400).json({ error }));
});

//get all brands
router.get("/", async (req, res) => {
  db("brands")
    .select("*")
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((error) => res.status(400).json({ error }));
});

module.exports = router;
