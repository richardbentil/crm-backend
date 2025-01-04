import crypto from "crypto";
import User from "../models/User";
import sendEmail from "../utils/emailService";
import jwt from "jsonwebtoken";
import Organization from "../models/Organization";

// Get all users
const getUsers = async (req, res) => {
  const { search = "" } = req.query;

    const filter = { name: search };

  try {
    const user = await User.find(filter, "name email subscriptionPlan billingCycle planDetails");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id, "name email subscriptionPlan billingCycle planDetails");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new user (Admin-only)
const createUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

     // Generate a reset token
     const token = crypto.randomBytes(32).toString("hex");

     // Generate a verification token
     const resetToken = jwt.sign({ token }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    // Create a reset URL
    const resetUrl = `${origin}/auth/reset-password?resetToken=${resetToken}`;

    // Send reset password email
    const emailResponse = await sendEmail(
      email,
      "Team member",
      "Added as a team member",
      `
        <p>You have been added as a team member on CRM Pro.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `
    );

    if (!emailResponse.messageId) {
      throw new Error("Failed to add user.");
    }

    //get organization and add the organization id
    const organization = await Organization.findById(req?.user?.id)


    const user = await User.create({ name, email, phone, role, password: '', organizationId: organization?._id });
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a user's role or details (Admin-only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a user (Admin-only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findOneAndDelete({ _id: id, createdBy: req.user.id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getUsers, getUser, createUser, updateUser, deleteUser };
