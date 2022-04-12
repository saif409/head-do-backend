const express = require("express");
const {
     addGlobalConfig,
     getGlobalConfigs,
     updateGlobalConfig,
     getGlobalConfigById,
     deleteGlobalConfig,
     getActiveGlobalConfig
    } = require('../controllers/globalConfigController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addGlobalConfig));
router.get("",asyncMiddleWare(getGlobalConfigs));
router.get("/active",asyncMiddleWare(getActiveGlobalConfig));
router.get("/id/:id",asyncMiddleWare(getGlobalConfigById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_GLOBAL_CONFIGS)], asyncMiddleWare(updateGlobalConfig));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_GLOBAL_CONFIGS)], asyncMiddleWare(deleteGlobalConfig));

module.exports=router;