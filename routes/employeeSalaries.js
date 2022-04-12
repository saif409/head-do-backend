const express = require("express");
const {
     addEmployeeSalary,
     getEmployeeSalaries,
     updateEmployeeSalary,
     getEmployeeSalaryById,
     deleteEmployeeSalary
    } = require('../controllers/employeeSalaryController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");
    const PERMISSIONS = require('../middleware/permissionString');

router.post("/create", [auth], asyncMiddleWare(addEmployeeSalary));
router.get("",asyncMiddleWare(getEmployeeSalaries));
router.get("/id/:id", [auth],asyncMiddleWare(getEmployeeSalaryById));
router.put("/update/:id",[auth], asyncMiddleWare(updateEmployeeSalary));
router.delete("/delete/:id",[auth], asyncMiddleWare(deleteEmployeeSalary));

module.exports=router;