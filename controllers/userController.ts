import crypto from "crypto";
import User from "../models/User";
import sendEmail from "../utils/emailService";
import jwt from "jsonwebtoken";
import Organization from "../models/Organization";
import Task from "../models/Task";
import Deal from "../models/Deal";

// Get all users
const getUsers = async (req, res, next) => {
  const { search = "", page = 1, limit = 10 } = req.query;

  // Convert page and limit to numbers and set defaults if invalid
  const pageNumber = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
  const limitNumber = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1
  const skip = (pageNumber - 1) * limitNumber;

  const filter = search
    ? { name: { $regex: search, $options: "i" } } // Case-insensitive search
    : {};

  try {
    // Fetch users with pagination
    const users = await User.find(
      {...filter, createdBy: req.user.id},
      "name email phone role"
    )
      .skip(skip)
      .limit(limitNumber);

    const totalUsers = await User.countDocuments(filter); // Total matching users
    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.status(200).json({
      currentPage: pageNumber,
      totalPages,
      totalUsers,
      limit: limitNumber,
      data: users || [],
    });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
    });
  }
};


const getUser = async (req, res, next) => {
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
const createUser = async (req, res, next) => {
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

    const origin = req.headers.origin || process.env.CLIENT_URL

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
    const organization = await Organization.findOne({ownerId: req?.user?.id})


    const user = await User.create({ name, email, phone, role, password: 'ndijutfnj', organizationId: organization?._id, createdBy: req.user.id });
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};

// Update a user's role or details (Admin-only)
const updateUser = async (req, res, next) => {
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
    next({
      status: 500,
      message: err.message,
  })
  }
};

const assignUsers = async (req, res, next) => {
  try {
    const { userId, action, dealOrTaskId } = req.body;

    if (action == "addToTask") {
     
    } else {
      await Deal.findOneAndUpdate(
        { _id: dealOrTaskId },
        {
          $push: {
            teamMembers: {
              userId
            },
          },
        },
        { new: true, upsert: true } // Create a document if it doesn't exist
      );
    }

    res.status(200).json({ message: "Assigned user successfully" });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};




const unAssignUser = async (req, res, next) => {
  try {
    const { userId, action, dealOrTaskId } = req.body;

    if (action == "removeFromTask") {
      await Task.findOneAndUpdate(
        { _id: dealOrTaskId },
        {
          $pull: {
            teamMembers: {
              userId
            },
          },
        },

      );
    } else {
      await Deal.findOneAndUpdate(
        { _id: dealOrTaskId },
        {
          $pull: {
            teamMembers: {
              userId
            },
          },
        },

      );
    }

    res.status(200).json({ message: "Unassigned user successfully" });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};

// Delete a user (Admin-only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findOneAndDelete({ _id: id, createdBy: req.user.id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};

export { getUsers, getUser, createUser, updateUser, deleteUser, assignUsers, unAssignUser };
