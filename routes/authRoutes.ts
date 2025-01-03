import { forgotPassword, resetPassword, updateCompany, updateUser, verifyEmail } from "../controllers/authController";

import express from "express";
import { register, login } from "../controllers/authController";
const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.patch("/update", updateUser)
router.patch("/update-company", updateCompany)

export default router;
