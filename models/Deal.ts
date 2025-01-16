import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deal name is required."],
    },
    value: {
      type: Number,
      required: [true, "Deal value is required."],
      min: [0, "Deal value cannot be negative."],
    },
    stage: {
      type: String,
      enum: {
        values: ["Lead", "Opportunity", "Won", "Lost"],
        message: "Stage must be one of 'Lead', 'Opportunity', 'Won', or 'Lost'.",
      },
      default: "Lead",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An owner must be assigned to the deal."],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "The creator of the deal is required."],
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        url: {
          type: String,
          required: [true, "Attachment URL is required."],
        },
        public_id: {
          type: String,
          required: [true, "Attachment public ID is required."],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expectedCloseDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
