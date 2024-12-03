import express from "express";
import { createDeal, getDeals, updateDealStage, deleteDeal } from "../controllers/dealController";
import protect from "../middlewares/authMiddleware";
import { uploadFile } from "../controllers/uploadController";

const router = express.Router();

router.post("/", protect, createDeal);
router.get("/", protect, getDeals);
router.patch("/:id", protect, updateDealStage);
router.delete("/:id", protect, deleteDeal);
router.post("/:id/upload", protect, uploadFile);

export default router;
