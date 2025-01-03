import express from "express";
import upload from "../middlewares/fileUploads";
import { importContacts, exportContacts } from "../controllers/importExportController";
import protect from "../middlewares/authMiddleware";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

// Routes
router.post("/contacts/import", protect, checkSubscriptionStatus, upload.single("file"), importContacts);
router.get("/contacts/export", protect, exportContacts);

export default router;
