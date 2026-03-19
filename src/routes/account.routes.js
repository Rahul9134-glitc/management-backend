import express from "express";
const router = express.Router();
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addMoney, updateAccount , createAccount , getMyAccounts } from "../controller/account.controlles.js";

router.route("/create").post(verifyJWT , createAccount)
router.route("/all").get(verifyJWT , getMyAccounts);
router.route("/add-money/:accountId").post(verifyJWT , addMoney);
router.route("/update-money/:accountId").patch(verifyJWT , updateAccount)



export default router;