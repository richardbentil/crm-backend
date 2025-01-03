import express from "express";
import protect from "../middlewares/authMiddleware";
import { createTemplate, deleteTemplate, getTemplate, getTemplates } from "../controllers/emailTemplateController";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

// Create a new email template
router.post("/", protect, checkSubscriptionStatus, createTemplate);

// Get all email templates for the user
router.get("/", protect, getTemplates);

// Get a specific email template by ID
router.get("/:id", protect, getTemplate);

router.delete("/:id", protect, deleteTemplate);

export default router;
