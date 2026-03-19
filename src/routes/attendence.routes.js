import express from "express";
import { getWorkerSummary, markBulkAttendance } from "../controller/attendence.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(verifyJWT);


router.route("/mark").post(markBulkAttendance);
router.route("/summary/:workerId").get(getWorkerSummary);


export default router;