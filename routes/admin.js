const express = require("express");
const router = express.Router();
const { db } = require("../config/connection");
const bcrypt = require("bcrypt-nodejs");

//register new employee
router.post("/addEmployee", async (req, res) => {
  const { empId, name, email, phone, gender, location, jobTitle } = req.body;
  const hash = bcrypt.hashSync(email);
  db("employees")
    .insert({
      empId,
      name,
      email,
      password: hash,
      phone,
      gender,
      location,
      jobTitle,
    })
    .then(() => {
      res.status(200).json({ message: "Resgistration Successfull!" });
    })
    .catch((error) => res.status(400).json({ error }));
});

//delete an employee
router.delete("/:id", async (req, res) => {
  db("employees")
    .where("empId", req.params.id)
    .del()
    .then((data) => {
      res.status(200).json({ message: "Employee Deleted successfully" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  db.select("email", "password")
    .from("employees")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].password);
      if (isValid) {
        res.status(200).json({ message: "Login Successfull" });
      } else {
        res.status(400).json({ error: "Wrong credintials!" });
      }
    })
    .catch((error) => res.status(400).json({ error: "User not found!" }));
});

module.exports = router;
