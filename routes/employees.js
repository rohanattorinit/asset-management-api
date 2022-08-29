const express = require("express");
const router = express.Router();
const { db } = require("../config/connection");

//get all employees
router.get("/", async (req, res) => {
  db.select("*")
    .from("employees")
    .then((data) => {
      res
        .status(200)
        .json({ message: "All employees fetched successfully", data: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: err, message: "Error while fetching all employees" });
    });
});

//get a single employee
router.get("/(:id)", async (req, res) => {
  const id = req.params.id;
  db.select("*")
    .from("employees")
    .where("EmpId", id)
    .then((data) => {
      res
        .status(200)
        .json({ message: "Employee fetched successfully", data: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: err, message: "Error while fetching employees" });
    });
});

//create an employee
router.post("/", async (req, res) => {
  const empData = req.body;
  db("employees")
    .insert(empData)
    .then((data) => {
      res
        .status(200)
        .json({ message: "Employee created successfully", data: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: err, message: "Error while creating employee" });
    });
});

//create bulk employees
router.post("/bulk", async (req, res) => {
  const empData = req.body;

  // handle csv data

  db("employees")
    .insert(empData)
    .then((data) => {
      res
        .status(200)
        .json({ message: "Employees created successfully", data: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: err, message: "Error while creating employees" });
    });
});

//update an employee
router.post("/update/(:id)", async (req, res) => {
  const empData = req.body;
  const id = empData.id;
  db("employees")
    .insert(empData)
    .then((data) => {
      res
        .status(200)
        .json({ message: "Employee created successfully", data: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: err, message: "Error while creating employees" });
    });
});

//delete an employee
router.post("/delete/(:id)", async (req, res) => {
  const empData = req.body;
  db("employees")
    .insert(empData)
    .then((data) => {
      res
        .status(200)
        .json({ message: "Employee created successfully", data: data });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ error: err, message: "Error while creating employees" });
    });
});

module.exports = router;
