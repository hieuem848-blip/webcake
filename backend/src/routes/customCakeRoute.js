import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createCustomCakeRequest,
  getMyCustomCakeRequests,
  getCustomCakeDetail,
  cancelCustomCakeRequest,
} from "../controllers/customCakeController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createCustomCakeRequest);
router.get("/", getMyCustomCakeRequests);
router.get("/:id", getCustomCakeDetail);
router.put("/:id/cancel", cancelCustomCakeRequest);

export default router;
