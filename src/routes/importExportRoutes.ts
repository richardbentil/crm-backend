import express from "express";
import upload from "../middlewares/fileUploads";
import { importContacts, exportContacts } from "../controllers/importExportController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

// Routes
router.post("/contacts/import", protect, upload.single("file"), importContacts);
router.get("/contacts/export", protect, exportContacts);

export default router;
