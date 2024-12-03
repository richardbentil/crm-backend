import express from "express";
import protect from "../middlewares/authMiddleware";
import { uploadFile } from "../controllers/uploadController";
import upload from "../middlewares/fileUploads";

const router = express.Router();

router.post("/:id/upload", protect, upload.single("file"), uploadFile);

export default router;
