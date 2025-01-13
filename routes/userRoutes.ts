import express from "express";
import { getUsers, createUser, updateUser, deleteUser, unAssignUser, assignUsers, getUser } from "../controllers/userController";
import protect from "../middlewares/authMiddleware";
import checkRole from "../middlewares/roleMiddleware";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";
import { roles } from "../models/User";

const router = express.Router();

// Routes
router.get("/", protect, checkRole(["admin"]), getUsers); // Admin-only
router.get("/", protect, checkRole(["admin"]), getUser); // Admin-only
router.post("/", protect, checkSubscriptionStatus, checkRole(roles), createUser); // Admin-only
router.patch("/:id", protect, checkRole(["admin"]), updateUser); // Admin-only
router.delete("/:id", protect, checkRole(["admin"]), deleteUser); // Admin-only
router.patch("/assign-users", protect, checkRole(["admin"]), assignUsers); // Admin-only
router.patch("/unassign-users", protect, checkRole(["admin"]), unAssignUser); // Admin-only

export default router;
