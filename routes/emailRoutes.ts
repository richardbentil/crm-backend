import express from "express";
import { sendCustomerEmail } from "../controllers/emailController";
import protect from "../middlewares/authMiddleware";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/send", protect, checkSubscriptionStatus, sendCustomerEmail);

export default router;
