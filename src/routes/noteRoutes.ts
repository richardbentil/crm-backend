import express from "express";
import protect from "../middlewares/authMiddleware";
import { createNote, deleteNote, getNote, updateNote } from "../controllers/noteController";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/", protect, getNote);
router.patch("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;
