import express from "express";
import { createDeal, getDeals, updateDealStage, deleteDeal, assignUser } from "../controllers/dealController";
import protect from "../middlewares/authMiddleware";
import { uploadFile } from "../controllers/uploadController";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";
import checkRole from "../middlewares/roleMiddleware";

const router = express.Router();

router.post("/", protect, checkSubscriptionStatus, createDeal);
router.get("/", protect, getDeals);
router.get("/:id", protect, getDeals);
router.patch("/:id", protect, updateDealStage);
router.delete("/:id", protect, deleteDeal);
router.patch("/assign-user", protect, checkRole(["admin"]), assignUser); // Admin-only
router.post("/:id/upload", protect, checkSubscriptionStatus, uploadFile);

export default router;
