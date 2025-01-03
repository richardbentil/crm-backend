import express from "express";
import protect from "../middlewares/authMiddleware";
import { createTask, deleteTask, getTask, getTasks, updateTask } from "../controllers/taskController";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/", protect, checkSubscriptionStatus, createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTask);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
