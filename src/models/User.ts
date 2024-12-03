import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "SalesRep"], default: "SalesRep" },
  subscriptionPlan: {
    type: String,
    enum: ["Free", "Pro", "Enterprise"],
    default: "Free",
  },
  planDetails: {
    startDate: { type: Date },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
