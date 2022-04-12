const express = require("express");
const {
     addSubscriptionPlan,
     getSubscriptionPlans,
     updateSubscriptionPlan,
     getSubscriptionPlanById,
     deleteSubscriptionPlan
    } = require('../controllers/subscriptionPlanController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth, checkPermission(PERMISSIONS.CREATE_SUBSCRIPTION_PLANS)], asyncMiddleWare(addSubscriptionPlan));
router.get("", [auth, checkPermission(PERMISSIONS.READ_SUBSCRIPTION_PLANS)],asyncMiddleWare(getSubscriptionPlans));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_SUBSCRIPTION_PLAN)],asyncMiddleWare(getSubscriptionPlanById));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_SUBSCRIPTION_PLANS)], asyncMiddleWare(updateSubscriptionPlan));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_SUBSCRIPTION_PLANS)], asyncMiddleWare(deleteSubscriptionPlan));

module.exports=router;