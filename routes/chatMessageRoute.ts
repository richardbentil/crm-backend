import express from "express";
import protect from "../middlewares/authMiddleware";
import { getMessages, saveMessage } from "../controllers/ChatMessageController";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/save", protect, checkSubscriptionStatus, saveMessage);
router.get("/", protect, getMessages);

export default router;
