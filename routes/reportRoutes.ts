import express from "express";
import { getDashboardMetrics } from "../controllers/reportController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/dashboard", protect, getDashboardMetrics);

export default router;
