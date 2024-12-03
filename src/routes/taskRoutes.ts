import express from "express";
import protect from "../middlewares/authMiddleware";
import { createTask, deleteTask, getTask, getTasks, updateTask } from "../controllers/taskController";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTask);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
