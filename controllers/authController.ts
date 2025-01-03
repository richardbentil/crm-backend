import Organization from "../models/Organization";

// Import necessary modules
require("dotenv").config();
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import crypto from "crypto";
import sendEmail from "../utils/emailService";
import User from "../models/User";
// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Register function
const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, subscriptionPlan } = req.body;

    // Validate subscription plan
    const validPlans = ["basic", "standard", "premium"];
    if (!validPlans.includes(subscriptionPlan)) {
      throw new Error("Invalid subscription plan.");
    }
    
    const origin = req.headers.origin || process.env.FRONTEND_URL;
    const {emailResponse, verificationToken}: any = await sendVerificationEmail(email, name, origin)
  
    if (!emailResponse?.messageId) {
      throw new Error("There was an error signin up.");
    }

    // Create Stripe customer if not on the basic plan
    let stripeCustomer = null;
    if (subscriptionPlan !== "basic") {
      stripeCustomer = await stripe.customers.create({
        email,
        name,
      });
    }

    let stripeSubscriptionId = null;
    let planDetails = {};

    if (subscriptionPlan === "standard") {
      try {
        const subscription = await stripe.subscriptions.create({
          customer: stripeCustomer.id,
          items: [{ price: process.env.STRIPE_STANDARD_PRICE_ID }],
          trial_period_days: 7,
        });

        stripeSubscriptionId = subscription.id;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7); // Free trial period
        planDetails = { startDate, endDate, autoRenew: true };
      } catch (error) {
        throw new Error("Failed to create Stripe subscription: " + error.message);
      }
    } else if (subscriptionPlan === "basic") {
      planDetails = { startDate: new Date(), autoRenew: false };
    }

    // Create user in the database
   const user: any = await User.create(
      [
        {
          name,
          email,
          password,
          isVerified: false,
          verificationToken,
          subscriptionPlan,
          stripeCustomerId: stripeCustomer?.id,
          stripeSubscriptionId,
          planDetails,
        },
      ],
      { session }
    );

    //create organization account
    await Organization.create({
      ownerId: user?._id
    })

    await session.commitTransaction();
    session.endSession();


    res.status(201).json({ message: "User registered. Verification email sent."});
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.password) {
      return res.status(500).json({ error: "Password is missing in the database." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({ error: "Invalid credentials." });
    }

    if (user.isVerified == false) {
      const origin = req.headers.origin || process.env.FRONTEND_URL;
      const {emailResponse}: any = sendVerificationEmail(email, user?.name, origin)

      if(emailResponse?.messageId){
        return res.status(200).json({ message: "We realized your email hasn't been verified. We sent you a verification email." });
      } else {
        throw new Error(`There was an error`)
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const organization = await Organization.findOne({ ownerId: user._id });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        isVerified: user.isVerified,
        availableFeatures: req.features || [],
        organization,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "An unexpected error occurred during login." });
  }
};


// Verify Email function
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOneAndUpdate(
      { email: decoded.email, verificationToken: token },
      { isVerified: true, verificationToken: null },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user;
  try {
    // Check if user exists
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

     // Generate a reset token
     const token = crypto.randomBytes(32).toString("hex");

     // Generate a verification token
     const resetToken = jwt.sign({ token }, process.env.JWT_SECRET, {
      expiresIn: "20m",
    });

    // Set token and expiry in the database
    user.resetPasswordToken = token;
 
    await user.save();

    const origin = req.headers.origin || process.env.FRONTEND_URL;

    // Create a reset URL
    const resetUrl = `${origin}/auth/reset-password?resetToken=${resetToken}`;

    // Send reset password email
    const emailResponse = await sendEmail(
      email,
      "Password Reset Request",
      "Reset your password",
      `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    );

    if (!emailResponse.messageId) {
      throw new Error("Failed to send password reset email.");
    }

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Error in forgotPassword:", error.stack);

    // Cleanup database changes in case of an error
    if (user) {
      user.resetPasswordToken = undefined;
      await user.save();
    }

    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.query; // Token from URL
  const { newPassword } = req.body; // New password from request body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the hashed token and check if the token is still valid
    const user = await User.findOne({
      resetPasswordToken: decoded?.token
    });

    if (!user?.resetPasswordToken) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    user.password = await bcrypt.hash(newPassword, 8);

    // Clear the reset token and expiry
    user.resetPasswordToken = undefined;

    // Save the updated user
    await user.save();

    // Respond to the user
    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred. Please try again later." });
  }
};

// Cancel Subscription function
const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: "User or subscription not found." });
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.stripeSubscriptionId = null;
    user.subscriptionPlan = "basic";
    user.planDetails = { startDate: new Date(), autoRenew: false };
    await user.save();

    res.status(200).json({ message: "Subscription canceled successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update a user's role or details (Admin-only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, company } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({
        message: "Updated successful",
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          planDetails: user.planDetails,
          availableFeatures: req.features || [], // Ensure it's at least an empty array
        },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update users company
const updateCompany = async (req, res) => {
  try {
    const { name, email, address, phone, contactPerson } = req.body;

    const organization: any = await Organization.findById({ ownerId: req.user.id });
    if (!organization) return res.status(404).json({ error: "User not found" });

    organization.name = name
    organization.email = email
    organization.address = address
    organization.phone = phone
    organization.contactPerson = contactPerson

    await organization.save();
    res.status(201).json({ message: "Company data updated successfully", organization });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const sendVerificationEmail = async(email, name, origin) => {
  // Generate a verification token
  const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const verificationLink = `${origin}/auth/verify-email?token=${verificationToken}`;

    // Send verification email
    const emailResponse: any = await sendEmail(
      email,
      "Verify your email",
      "Email Verification",
      `
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
      `
    );

    return {emailResponse, verificationToken}
}




export { register, login, updateUser, updateCompany, verifyEmail, forgotPassword, resetPassword, cancelSubscription };
