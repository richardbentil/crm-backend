import express from "express";
import { createDeal, getDeals, updateDealStage, deleteDeal } from "../controllers/dealController";
import protect from "../middlewares/authMiddleware";
import { uploadFile } from "../controllers/uploadController";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/", protect, checkSubscriptionStatus, createDeal);
router.get("/", protect, getDeals);
router.patch("/:id", protect, updateDealStage);
router.delete("/:id", protect, deleteDeal);
router.post("/:id/upload", protect, checkSubscriptionStatus, uploadFile);

export default router;
