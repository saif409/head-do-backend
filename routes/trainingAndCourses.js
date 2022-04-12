const express = require("express");
const {
     addTrainingAndCourse,
     getTrainingAndCourses,
     updateTrainingAndCourse,
     getTrainingAndCourseById,
     deleteTrainingAndCourse
    } = require('../controllers/trainingAndCourseController');
    const router = express.Router();
    const { admin, checkPermission } = require('../middleware/authorization');
    const auth = require("../middleware/auth");
    const asyncMiddleWare = require("../middleware/async");

router.post("/create", [auth], asyncMiddleWare(addTrainingAndCourse));
router.get("",asyncMiddleWare(getTrainingAndCourses));
router.get("/id/:id", [auth],asyncMiddleWare(getTrainingAndCourseById));
router.put("/update/:id",[auth], asyncMiddleWare(updateTrainingAndCourse));
router.delete("/delete/:id",[auth], asyncMiddleWare(deleteTrainingAndCourse));

module.exports=router;