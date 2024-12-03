import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  dealId: { type: String, required: true },
  tasks: [
    {
      title: { type: String, required: true },
      description: { type: String },
      deadline: { type: Date },
      status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note"}],
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Task = mongoose.model("Task", TaskSchema);

export default Task;
