import { Request, Response, NextFunction } from "express";
import stripe from "stripe";
import User from "../models/User";
import { config } from "dotenv";

config();

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export const checkSubscriptionStatus = async (
  req,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id; // Assuming `req.user` contains authenticated user's details
    if (!userId) { 
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    // Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return
    }

    const { subscriptionPlan, stripeCustomerId, planDetails } = user;

    if (subscriptionPlan === "standard") {
      // Handle standard plan with trial
      const trialEndDate = planDetails?.endDate
        ? new Date(planDetails.endDate)
        : null;
      if (!trialEndDate || new Date() > trialEndDate) {
        res.status(403).json({
          error: "Your free trial has ended. Please subscribe to continue.",
        });
        return
      }
    } else if (subscriptionPlan === "premium") {
      // Handle premium plan with Stripe and grace period
      if (!stripeCustomerId) {
        res.status(403).json({
          error: "No Stripe customer linked. Please subscribe to continue.",
        });
        return
      }

      try {
        // Check active subscriptions in Stripe
        const subscriptions = await stripeClient.subscriptions.list({
          customer: stripeCustomerId,
          status: "active",
        });

        if (subscriptions.data.length === 0) {
          // No active subscription, check grace period
          const subscriptionEndDate = planDetails?.endDate
            ? new Date(planDetails.endDate)
            : null;

          if (subscriptionEndDate) {
            const currentDate = new Date();
            const graceEndDate = new Date(subscriptionEndDate);
            graceEndDate.setDate(graceEndDate.getDate() + 30); // Add 30 days to subscription end date

            if (currentDate <= graceEndDate) {
              // Allow access within grace period
              return next();
            }
          }

          res.status(403).json({
            error:
              "Your premium subscription and grace period have ended. Please renew to continue.",
          });
          return
        }
      } catch (stripeError: any) {
        res.status(500).json({
          error: "Failed to verify premium subscription with Stripe",
          details: stripeError.message,
        });
        return
      }
    } else {
      // Invalid or unsupported subscription plan
      res.status(400).json({ error: "Invalid subscription plan" });
      return
    }

    // Allow access if subscription or trial is valid
    next();
  } catch (error: any) {
    res.status(500).json({
      error: "Server error",
      details: error.message || "An unexpected error occurred",
    });
  }
};
