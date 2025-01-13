import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  dealId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Deal", 
    required: [true, "Deal ID is required and must be valid."] 
  },
  tasks: [
    {
      title: { 
        type: String, 
        required: [true, "Task title is required."] 
      },
      description: { 
        type: String, 
        default: "", 
        validate: {
          validator: function (value) {
            return value.length <= 500; // Example: Limit description to 500 characters
          },
          message: "Description cannot exceed 500 characters.",
        },
      },
      deadline: { 
        type: Date, 
        validate: {
          validator: function (value) {
            return value ? value > Date.now() : true; // Ensure deadline is a future date
          },
          message: "Deadline must be a future date.",
        },
      },
      status: { 
        type: String, 
        enum: {
          values: ["pending", "in-progress", "completed"],
          message: "Status must be one of 'pending', 'in-progress', or 'completed'.",
        }, 
        default: "pending" 
      },
      createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: [true, "Task must have a creator (createdBy)."] 
      },
      assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: [true, "Task must be assigned to a user (assignedTo)."] 
      },
      notes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Note" 
      }],
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
      updatedAt: { 
        type: Date, 
        default: Date.now 
      },
    },
  ],
}, { timestamps: true });

// Indexes for improved query performance
TaskSchema.index({ dealId: 1, "tasks.status": 1 });

// Pre-save middleware to update `updatedAt` on sub-documents
TaskSchema.pre("save", function (next) {
  this.tasks.forEach((task) => {
    task.updatedAt = new Date();
  });
  next();
});

const Task = mongoose.model("Task", TaskSchema);

export default Task;
