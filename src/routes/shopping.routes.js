import express from "express";
const router = express.Router();

import { verifyJWT } from "../middleware/auth.middleware.js";
import { createShoppingEntry } from "../controller/shopping.controllers.js";
import { getAccountShoppingHistory ,updateShoppingEntry,deleteShoppingEntry} from "../controller/shopping.controllers.js";

router.route("/add-item").post(verifyJWT, createShoppingEntry);
router
  .route("/get-history/:accountId")
  .get(verifyJWT, getAccountShoppingHistory);


router.route("/update-item/:shoppingId").patch(verifyJWT,updateShoppingEntry)  
router.route("/delete-item/:shoppingId").delete(verifyJWT , deleteShoppingEntry)

export default router;