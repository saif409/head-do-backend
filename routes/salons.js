const express = require("express");
const {
     addSalon,
     getSalons,
     updateSalon,
     getSalonById,
     salonVerify
    } = require('../controllers/salonController');
    const router = express.Router();
    const asyncMiddleWare = require("../middleware/async");

router.post("/create", asyncMiddleWare(addSalon));
router.get("", asyncMiddleWare(getSalons));
router.get("/id/:id" , asyncMiddleWare(getSalonById));
router.put("/update/:id", asyncMiddleWare(updateSalon));
router.put("/verify/:id", asyncMiddleWare(salonVerify));

module.exports=router;