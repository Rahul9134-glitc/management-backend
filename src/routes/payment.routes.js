import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addWorkerPayment,
  getWorkerPayments,
} from "../controller/payment.controllers.js";

const router = express.Router();

router.use(verifyJWT);


router.route("/add").post(addWorkerPayment);
router.route("/history/:workerId").get(getWorkerPayments);


export default router;
