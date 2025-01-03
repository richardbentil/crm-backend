import express from "express";
import protect from "../middlewares/authMiddleware";
import { uploadFile, getFiles, deleteFile } from "../controllers/uploadController";
import upload from "../middlewares/fileUploads";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/:id/upload", protect, checkSubscriptionStatus, upload.single("file"), uploadFile);
router.get("/:id/files", protect, getFiles);
router.delete("/:id/files", protect, deleteFile);

export default router;
