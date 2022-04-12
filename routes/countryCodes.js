const express = require("express");
const {
     addCountryCode,
     getCountryCodes,
     updateCountryCode,
     getCountryCodeById,
     deleteCountryCode
    } = require('../controllers/countryCodeController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addCountryCode));
router.get("",asyncMiddleWare(getCountryCodes));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_COUNTRY_CODE)],asyncMiddleWare(getCountryCodeById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_COUNTRY_CODES)], asyncMiddleWare(updateCountryCode));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_COUNTRY_CODES)], asyncMiddleWare(deleteCountryCode));

module.exports=router;