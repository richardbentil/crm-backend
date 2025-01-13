const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true }, // Unique organization name
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // References User model
    plan: { type: String, enum: ["Free", "Basic", "Standard", "Premium"], default: "Free" },
    phone: { type: String, unique: true }, // Optional, but unique if provided
    address: { type: String }, // Optional
    email: { type: String, unique: true}, // Email of the organization
    contactPerson: { type: String }, // Optional reference to another user
  },
  { timestamps: true }
);

export default mongoose.model("Organization", OrganizationSchema);
