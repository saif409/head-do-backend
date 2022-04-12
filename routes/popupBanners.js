const express = require("express");
const {
     addPopupBanners,
     getAllPopupBanners,
     updatePopupBanners,
     getPopupBannersById,
     deletePopupBanners,
     getActiveBanner
    } = require('../controllers/PopupBannersController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addPopupBanners));
router.get("",asyncMiddleWare(getAllPopupBanners));
router.get("/active",asyncMiddleWare(getActiveBanner));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_POPUP_BANNER)],asyncMiddleWare(getPopupBannersById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_POPUP_BANNERS)], asyncMiddleWare(updatePopupBanners));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_POPUP_BANNERS)], asyncMiddleWare(deletePopupBanners));

module.exports=router;