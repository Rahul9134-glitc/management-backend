import { Router } from "express";
import { addExpense , approveExpense ,getGroupExpenses } from "../controller/expenseController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Saare routes protected hain
router.route("/add").post(verifyJWT, addExpense);
router.route("/approve/:expenseId").patch(verifyJWT, approveExpense);
router.route("/group/:groupId").get(verifyJWT, getGroupExpenses);

export default router;