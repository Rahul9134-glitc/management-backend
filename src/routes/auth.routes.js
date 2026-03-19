import express from "express";
const router = express.Router();


import { logoutUser, registerUser,getCurrentUser } from "../controller/auth.controllers.js";
import { loginUser } from "../controller/auth.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/current-user").get(verifyJWT , getCurrentUser);


export default router;