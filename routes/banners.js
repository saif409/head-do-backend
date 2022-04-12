const express = require("express");
const {
     addBanner,
     getBanners,
     updateBanner,
     getBannerById,
     deleteBanner,
     getBannersPrivate
    } = require('../controllers/bannerController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth, checkPermission(PERMISSIONS.CREATE_BANNERS)], asyncMiddleWare(addBanner));
router.get("", asyncMiddleWare(getBanners));
router.get("/private",[auth, checkPermission(PERMISSIONS.READ_BANNERS)], asyncMiddleWare(getBannersPrivate));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_BANNER)],asyncMiddleWare(getBannerById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_BANNERS)], asyncMiddleWare(updateBanner));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_BANNERS)], asyncMiddleWare(deleteBanner));


module.exports=router;