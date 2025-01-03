/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: API for managing contacts
 */

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Retrieve a list of contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: List of contacts
 *       500:
 *         description: Error retrieving contacts
 */
import express from "express";
import checkRole from "../middlewares/roleMiddleware";
import { createContact, getContacts, updateContact, deleteContact } from "../controllers/contactController";
import protect from "../middlewares/authMiddleware";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/", protect, checkSubscriptionStatus, createContact);
router.get("/", protect, getContacts);
router.patch("/:id", protect, updateContact);
router.delete("/:id", protect, checkRole(["Admin"]), deleteContact);

export default router;
