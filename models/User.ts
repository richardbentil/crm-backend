import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const roles = ["admin", "salesrep", "manager", "other", "accountant"];

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"] 
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true 
    },
    phone: { 
      type: String
    },
    role: { 
      type: String, 
      enum: {
        values: roles,
        message: "Role must be one of the following: admin, salesrep, manager, other, or accountant"
      },
      default: "admin" 
    },
    subscriptionPlan: {
      type: String,
      enum: {
        values: ["basic", "standard", "premium"],
        message: "Subscription plan must be one of the following: basic, standard, or premium"
      },
      default: "basic",
    },
    planDetails: {
      startDate: { type: Date },
      endDate: { type: Date },
      autoRenew: { type: Boolean, default: true },
    },
    stripeCustomerId: String,
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    stripeSubscriptionId: String,
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdBy: String
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
