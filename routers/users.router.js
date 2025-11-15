const express = require("express");
const router =  express.Router();
const {getUsers , getUser ,profile , register , login} = require("../controllers/users.controller");
const verifyToken = require('../middelwares/verifyToken');
router.route("/profile")
        .get(verifyToken , profile);
router.route("/")
        .get(getUsers)
router.route("/:id")
        .get(getUser)
router.route("/register")
        .post(register);
router.route("/login")
        .post(login);

module.exports = router;