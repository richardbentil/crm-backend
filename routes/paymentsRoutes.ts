import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { cancel, checkout, invoices, subscriptions, updateSubscription, webhook } from "../controllers/payment";

const router = express.Router();

/**
 * Route: POST /api/payment/checkout
 * Description: Create a checkout session for subscription upgrade
 */
router.post("/checkout", authMiddleware, checkout);

/**
 * Route: POST /api/payment/webhook
 * Description: Handle Stripe webhook events for subscription updates
 */
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

/**
 * Route: GET /api/payment/invoices
 * Description: Retrieve invoices for the authenticated user
 */
router.get("/invoices", authMiddleware, invoices);

/**
 * Route: GET /api/payment/subscriptions
 * Description: Retrieve all subscriptions for admin
 */
router.get("/subscriptions", authMiddleware, subscriptions);


/**
 * Route: POST /api/payment/update-subscription
 * Description: Update the subscription plan for the authenticated user
 */
router.post("/update-subscription", authMiddleware, updateSubscription);
  
/**
 * Route: POST /api/payment/cancel
 * Description: Cancel the authenticated user's subscription
 */
router.post("/cancel", authMiddleware, cancel);

export default router;
