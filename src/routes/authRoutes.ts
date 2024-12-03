import { updateCompany, updateUser } from "../controllers/authController";

import express from "express";
import { register, login } from "../controllers/authController";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/update", updateUser)
router.patch("/update-company", updateCompany)

export default router;
