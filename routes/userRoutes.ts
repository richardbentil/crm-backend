import express from "express";
import { getUsers, createUser, updateUser, deleteUser, getUser, assignUser, unAssignUser, assignAssignee } from "../controllers/userController";
import protect from "../middlewares/authMiddleware";
import checkRole from "../middlewares/roleMiddleware";
import { checkSubscriptionStatus } from "../middlewares/checkSubscription";

const router = express.Router();

// Routes
router.get("/", protect, checkRole(["Admin"]), getUsers); // Admin-only
router.get("/", protect, checkRole(["Admin"]), getUser); // Admin-only
router.post("/", protect, checkSubscriptionStatus, checkRole(["Admin"]), createUser); // Admin-only
router.patch("/:id", protect, checkRole(["Admin"]), updateUser); // Admin-only
router.delete("/:id", protect, checkRole(["Admin"]), deleteUser); // Admin-only

router.patch("/assignusers", protect, checkRole(["Admin"]), assignUser); // Admin-only
router.patch("/unassignusers", protect, checkRole(["Admin"]), unAssignUser); // Admin-only
router.patch("/assignassignee", protect, checkRole(["Admin"]), assignAssignee); // Admin-only

export default router;
