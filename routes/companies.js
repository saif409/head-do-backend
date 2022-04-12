const express = require("express");
const {
     addCompany,
     getCompanies,
     updateCompany,
     getCompanyById,
     companyVerify
    } = require('../controllers/companyController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth, checkPermission(PERMISSIONS.CREATE_COMPANIES)], asyncMiddleWare(addCompany));
router.get("", asyncMiddleWare(getCompanies));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_COMPANY)] ,asyncMiddleWare(getCompanyById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_COMPANIES)], asyncMiddleWare(updateCompany));
router.put("/verify/:id",[auth, checkPermission(PERMISSIONS.VERIFY_COMPANIES)], asyncMiddleWare(companyVerify));

module.exports=router;