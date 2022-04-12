
const { 
    getNotifications, 
    getLiveUserCount,
    orderGraphByDay,
    customerRegGraphByDay,
    lastMonthTotalSale,
    thisMonthTotalSale,
    topSoldProducts,
    vendorDashboardInfo,
    avgNumberOfOrdersPerCustomers,
    getDashboardData
} = require('../controllers/dashboardController');

const express = require("express");
const router = express.Router();
const asyncMiddleWare = require("../middleware/async");
const auth = require("../middleware/auth");
const { checkPermission } = require('../middleware/authorization');
const PERMISSIONS = require('../middleware/permissionString');


router.get('/', [auth], asyncMiddleWare(getDashboardData));
router.get("/notifications",[auth], asyncMiddleWare(getNotifications));

router.get("/live-user-count", [[auth], checkPermission(PERMISSIONS.VIEW_ONLINE_VISITORS)], asyncMiddleWare(getLiveUserCount));
router.get("/order-graph-by-day", [auth, checkPermission(PERMISSIONS.VIEW_ORDER_GRAPH_BY_DAY)], asyncMiddleWare(orderGraphByDay))
router.get("/customer-reg-graph-by-day", [auth, checkPermission(PERMISSIONS.VIEW_CUSTOMER_REGISTRATION_GRAPH)], asyncMiddleWare(customerRegGraphByDay))
router.get("/last-month-total-sale", [auth, checkPermission(PERMISSIONS.VIEW_LAST_MONTH_TOTAL_SALE)], asyncMiddleWare(lastMonthTotalSale))
router.get("/this-month-total-sale", [auth, checkPermission(PERMISSIONS.VIEW_THIS_MONTH_TOTAL_SALE)], asyncMiddleWare(thisMonthTotalSale))
router.get("/top-sold-products", [auth, checkPermission(PERMISSIONS.VIEW_TOP_SOLD_PRODUCTS)], asyncMiddleWare(topSoldProducts))
router.get("/vendor-dashboard-info", [auth, checkPermission(PERMISSIONS.VIEW_VENDOR_DASHBOARD)], asyncMiddleWare(vendorDashboardInfo))
router.get("/average-number-of-order-per-customers", [auth, checkPermission(PERMISSIONS.VIEW_AVERAGE_NUMBER_OF_ORDER_PER_CUSTOMER)], asyncMiddleWare(avgNumberOfOrdersPerCustomers));

module.exports=router;