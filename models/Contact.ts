import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    company: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexing for faster searching on name, email, and phone
contactSchema.index({ name: "text", email: "text", phone: "text" });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
