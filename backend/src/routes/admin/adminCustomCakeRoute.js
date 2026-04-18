import express from "express";
import { getAllCustomCakeRequests, getCustomCakeDetail, quoteCustomCake, rejectCustomCake, completeCustomCake } from "../../controllers/admin/adminCustomCakeController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/", getAllCustomCakeRequests);
router.get("/:id", getCustomCakeDetail);
router.put("/:id/quote", quoteCustomCake);
router.put("/:id/reject", rejectCustomCake);
router.put("/:id/complete", completeCustomCake);

export default router;
