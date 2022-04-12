const express = require("express");
const {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
    } = require('../controllers/expenseController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(createExpense));
router.get("", asyncMiddleWare(getAllExpenses));
router.get("/id/:id", [auth], asyncMiddleWare(getExpenseById))
router.put("/update/:id",[auth], asyncMiddleWare(updateExpense));
router.delete("/delete/:id",[auth], asyncMiddleWare(deleteExpense));

module.exports=router;