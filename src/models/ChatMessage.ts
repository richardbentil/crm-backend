import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // Unique identifier for each chat room (e.g., dealId)
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;
