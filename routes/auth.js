const express = require("express");
const router = express.Router();
const { db } = require("../config/connection");
const bcrypt = require("bcrypt-nodejs");

//login
router.post("/", async (req, res) => {
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
