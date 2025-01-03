import express from "express";
import { getUsers, createUser, updateUser, deleteUser, getUser } from "../controllers/userController";
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

export default router;
