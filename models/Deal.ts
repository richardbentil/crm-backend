import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    stage: { type: String, enum: ["Lead", "Opportunity", "Won", "Lost"], default: "Lead" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note"}],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    attachments: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }, // For deletion from Cloudinary
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
