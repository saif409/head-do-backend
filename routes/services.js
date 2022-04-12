const express = require("express");
const {
     addService,
     getServices,
     updateService,
     getServiceById,
     getParentServices,
     approveService,
     deleteService,
     makeHotService
    } = require('../controllers/serviceController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addService));
router.get("", asyncMiddleWare(getServices));
router.get("/parents", asyncMiddleWare(getParentServices));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_SERVICE)], asyncMiddleWare(getServiceById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_SERVICES)], asyncMiddleWare(updateService));
router.put("/verify/:id",[auth, checkPermission(PERMISSIONS.VERIFY_SERVICES)], asyncMiddleWare(approveService));
router.put("/hot/:id",[auth, checkPermission(PERMISSIONS.CREATE_HOT_SERVICES)], asyncMiddleWare(makeHotService));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_SERVICES)], asyncMiddleWare(deleteService));

module.exports=router;