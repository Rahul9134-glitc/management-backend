import express from "express";
const router = express.Router();

import { addWorker, getWorkerFullDetails } from "../controller/worker.controllers.js";
import { getWorkersByRole , updateWorker , deleteWorker } from "../controller/worker.controllers.js";
import {verifyJWT} from "../middleware/auth.middleware.js";


router.use(verifyJWT);

router.route("/register").post(addWorker);
router.route("/all").get(getWorkersByRole);
router.route("/update-worker/:workerId").patch(updateWorker);
router.route("/delete-worker/:workerId").delete(deleteWorker);
router.route("/detail/:workerId").get(getWorkerFullDetails);


export default router;



