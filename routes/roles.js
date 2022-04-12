const express = require("express");
const {
     addRole,
     getRoles,
     updateRole,
     deleteRole,
     getRoleById,
     getUserPermissions,
     getAllPermissions
    } = require('../controllers/roleController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

// router.post("/create", [auth, checkPermission(PERMISSIONS.CREATE_ROLES)], asyncMiddleWare(addRole));
router.post("/create", asyncMiddleWare(addRole));
router.get("", asyncMiddleWare(getRoles));
router.get("/id/:id", [auth, ],asyncMiddleWare(getRoleById));
router.put("/update/:id",[auth], asyncMiddleWare(updateRole));
router.delete("/delete/:id",[auth], asyncMiddleWare(deleteRole));
router.get("/user-permissions", [auth], asyncMiddleWare(getUserPermissions));
router.get('/all-permissions', [auth], asyncMiddleWare(getAllPermissions));
module.exports=router;