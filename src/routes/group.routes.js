import {Router} from "express";
import { createGroup , getGroupDetails , joinGroup , toggleMemberStatus , requestInactiveStatus , approveInactiveRequest } from "../controller/group.controllers.js";
import {verifyJWT} from "../middleware/auth.middleware.js"


const router = Router();

router.use(verifyJWT);

router.route("/create").post(createGroup);
router.route("/join").post(joinGroup);
router.route("/details").get(getGroupDetails);
router.route("/toggle-status").patch(verifyJWT, toggleMemberStatus);
router.route("/request-inactive").patch(verifyJWT, requestInactiveStatus);
router.route("/approve-inactive/:targetUserId").patch(verifyJWT, approveInactiveRequest);


export default router;