const express = require("express");
const {
     addCity,
     getCities,
     updateCity,
     getCityById,
     deleteCity
    } = require('../controllers/cityController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addCity));
router.get("",asyncMiddleWare(getCities));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_CITY)],asyncMiddleWare(getCityById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_CITIES)], asyncMiddleWare(updateCity));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_CITIES)], asyncMiddleWare(deleteCity));

module.exports=router;