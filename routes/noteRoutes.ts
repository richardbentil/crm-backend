import express from "express";
import protect from "../middlewares/authMiddleware";
import { createNote, deleteNote, getNote, updateNote } from "../controllers/noteController";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/", protect, checkSubscriptionStatus, createNote);
router.get("/", protect, getNote);
router.patch("/", protect, updateNote);
router.delete("/", protect, deleteNote);

export default router;
