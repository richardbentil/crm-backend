import express from "express";
import { sendCustomerEmail } from "../controllers/emailController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/send", protect, sendCustomerEmail);

export default router;
