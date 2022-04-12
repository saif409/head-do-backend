const express = require("express");
const {
     addTransaction,
     getTransactions,
     updateTransaction,
     getTransactionById,
     deleteTransaction,
     getTransactionByOrderNumber,
     refundPayment
    } = require('../controllers/transactionController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addTransaction));
router.get("",asyncMiddleWare(getTransactions));
router.get("/id/:id", [auth, checkPermission(PERMISSIONS.READ_SINGLE_TRANSACTION)],asyncMiddleWare(getTransactionById));
router.get("/orderNumber/:orderNumber" ,asyncMiddleWare(getTransactionByOrderNumber));
router.put("/orderNumber/:orderNumber" ,asyncMiddleWare(refundPayment));
router.put("/update/:id",[auth, checkPermission(PERMISSIONS.UPDATE_TRANSACTIONS)], asyncMiddleWare(updateTransaction));
router.delete("/delete/:id",[auth, checkPermission(PERMISSIONS.DELETE_TRANSACTIONS)], asyncMiddleWare(deleteTransaction));

module.exports=router;