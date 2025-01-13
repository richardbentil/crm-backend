// Backend: leadSchema.js
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Unqualified"],
      default: "New",
    },
    company: { type: String },
    notes: { type: String },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Lead = mongoose.model("Lead", leadSchema);


export default Lead