const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const asyncMiddleWare = require("../middleware/async");
const { getDashboardData, adminDashboardInfo, customerRegGraphByDay, providerRegGraphByDay, bookingGraphByDay } = require("../controllers/dashboardController");

router.get('/', [auth], asyncMiddleWare(getDashboardData));
router.get('/admin-dashboard-info', asyncMiddleWare(adminDashboardInfo));
router.get('/customer-reg-graph', asyncMiddleWare(customerRegGraphByDay));
router.get('/provider-reg-graph', asyncMiddleWare(providerRegGraphByDay));
router.get('/booking-graph', asyncMiddleWare(bookingGraphByDay));

module.exports=router;