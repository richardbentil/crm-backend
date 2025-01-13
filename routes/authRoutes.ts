import { register, forgotPassword, resetPassword, updateCompany, updateUser, verifyEmail, login } from "../controllers/authController";

import express from "express";
import protect from "../middlewares/authMiddleware";
const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.patch("/update", protect, updateUser)
router.patch("/update-company", protect, updateCompany)

export default router;
