const Joi = require("joi");
const { login, logout, refreshToken } = require("../controllers/authController");
const express = require("express");
const router = express.Router();
const asyncMiddleWare = require("../middleware/async");
const auth = require("../middleware/auth");

router.post("/login", asyncMiddleWare(login));
router.post("/logout", asyncMiddleWare(logout));
router.get("/refresh-token", [auth], refreshToken);

module.exports = router;
