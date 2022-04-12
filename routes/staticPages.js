const express = require("express");
const {
     addStaticPage,
     getStaticPages,
     updateStaticPage,
     getStaticPageById,
     deleteStaticPage,
     getByTitle
    } = require('../controllers/staticPageController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');


router.get("",  [auth, checkPermission(PERMISSIONS.READ_STATIC_PAGES)],asyncMiddleWare(getStaticPages));
router.get("/id/:id",asyncMiddleWare(getStaticPageById));
router.get("/title/:title",asyncMiddleWare(getByTitle));
router.post("/create",[auth], asyncMiddleWare(addStaticPage));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_STATIC_PAGES)], asyncMiddleWare(updateStaticPage));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_STATIC_PAGES)], asyncMiddleWare(deleteStaticPage))


module.exports = router;
    