const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const asyncMiddleWare = require("../middleware/async");
const { createRating, getProviderReview, updateRating, getRatingByBooking } = require("../controllers/rating_controller");
    

// router.post("/create", [auth, checkPermission(PERMISSIONS.CREATE_ROLES)], asyncMiddleWare(addRole));
router.post("/create",[auth], asyncMiddleWare(createRating));
router.get("/review/:id",[auth], asyncMiddleWare(getProviderReview));
router.put("/update/id/:id", [auth, ],asyncMiddleWare(updateRating));
router.get("/booking/:id", [auth, ],asyncMiddleWare(getRatingByBooking));

module.exports=router;