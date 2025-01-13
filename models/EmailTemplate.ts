const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    category: String,
  title: String,
  subject: String,
  body: String,
  placeholders: [String], // New feature: Dynamic placeholders
  tags: [String], // New feature: Tagging for better organization
  createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("EmailTemplate", emailTemplateSchema);
