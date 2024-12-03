import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  taskId: { type: String, required: true }, // Unique identifier for each task
  notes: [
    {
      content: { type: String, required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Note = mongoose.model("Note", NoteSchema);

export default Note;
