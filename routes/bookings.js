const express = require("express");
const {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    getBookedTimes,
    paymentReceive,
paymentBackendApi,
advancePaymentBackendApi,
addGarbageField
    } = require('../controllers/bookingController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(createBooking));
router.get("",[auth],  asyncMiddleWare(getAllBookings));
router.get("/id/:id", asyncMiddleWare(getBookingById));
router.put("/update/:id",[auth], asyncMiddleWare(updateBooking));
router.get("/get-booked-times/:providerId",[auth], asyncMiddleWare(getBookedTimes));
router.post("/payment-response", asyncMiddleWare(paymentReceive));
router.post("/advance-payment/backend-url", asyncMiddleWare(advancePaymentBackendApi));
router.post("/payment/backend-url", asyncMiddleWare(paymentBackendApi));
router.get("/add-garbage-field", asyncMiddleWare(addGarbageField));

module.exports=router;