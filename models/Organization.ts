const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["Free", "Pro", "Enterprise"], default: "Free" },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    email: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    contactPerson: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", OrganizationSchema);
