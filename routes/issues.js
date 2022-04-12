const express = require("express");
const { createIssues, getAllIssues, getIssueById, checkIssueById} = require('../controllers/issueController');
    const router = express.Router();
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");

router.post("/create", [auth], asyncMiddleWare(createIssues));
router.get("", [auth],asyncMiddleWare(getAllIssues));
router.get("/id/:id",  [auth],asyncMiddleWare(getIssueById));
router.put("/check/:id", [auth], asyncMiddleWare(checkIssueById));

module.exports=router;