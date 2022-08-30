const express = require("express");
const router = express.Router();
const { db } = require("../config/connection");

//get all employees
router.get("/", async (req, res) => {
  db.select("*")
    .from("employees")
    .then((data) => {
      res.status(200).json({
        message: "All employees fetched successfully",
        data: data,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//get a single employee
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("employees")
    .where("empId", "=", id)
    .then((data) => {
      if (data[0]) {
        res.status(200).json({ data });
      } else {
        res.status(400).json({ error: "Employee not found!" });
      }
    })
    .catch((error) => res.status(400).json({ error }));
});

//update an employee
router.post("/update/:id", async (req, res) => {
  const { name, email, phone, gender, location, jobTitle } = req.body;
  const { id } = req.params;
  db("employees")
    .where("empId", id)
    .update({
      name,
      email,
      phone,
      gender,
      location,
      jobTitle,
    })
    .then(() => {
      res.status(200).json({ message: "Details Updated successfully" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//chnage password
router.post("/changePassword/:id", async (req, res) => {
  const { password } = req.body;
  const hash = bcrypt.hashSync(password);
  db("employees")
    .where("empId", req.params.id)
    .update({ password: hash })
    .then(() => {
      res.status(200).json({ message: "Password Changed Successfully!" });
    });
});

module.exports = router;
