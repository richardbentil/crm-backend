import express from "express";
import protect from "../middlewares/authMiddleware";
import { getMessages, saveMessage } from "../controllers/ChatMessageController";

const router = express.Router();

router.post("/save", protect, saveMessage);
router.get("/", protect, getMessages);

export default router;
