import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["Admin", "SalesRep"], default: "Admin" },
  subscriptionPlan: {
    type: String,
    enum: ["basic", "standard", "premium"],
    default: "basic",
  },
  planDetails: {
    startDate: { type: Date },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  stripeCustomerId: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  stripeSubscriptionId: String,
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
