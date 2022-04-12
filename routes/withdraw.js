const asyncMiddleWare = require("../middleware/async");
const express = require("express");
const { getAllWithdraw, createWithdraw, getWithdrawById,
    updateWithdraws } = require("../controllers/withdrawController");
const auth = require("../middleware/auth");
const { admin } = require("../middleware/authorization");
const router = express.Router();

router.get("/", [auth], asyncMiddleWare(getAllWithdraw));
router.post("/create", [auth], asyncMiddleWare(createWithdraw));
router.get("/id/:id", [auth], asyncMiddleWare(getWithdrawById));
router.post("/update", [auth, admin], asyncMiddleWare(updateWithdraws));

module.exports = router;