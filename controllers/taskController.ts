import { io } from "..";
import Task from "../models/Task";

const createTask = async (req, res) => {
  try {
    const { title, description, deadline, dealId, assignedTo } = req.body;

    const updatedDeal = await Task.findOneAndUpdate(
      { dealId },
      {
        $push: {
          tasks: {
            title,
            description,
            deadline,
            createdBy: req.user.id,
            assignedTo
          },
        },
      },
      { new: true, upsert: true } // Create a document if it doesn't exist
    );

    // Emit the new task to clients in the room for the dealId
    io.to(dealId).emit("taskAdded", updatedDeal);

    res.status(201).json({ message: "Task created successfully", updatedDeal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { dealId } = req.params;

    const tasks = await Task.findOne({ dealId }).populate("tasks.createdBy tasks.assignedTo", "name email");

    if (!tasks) {
      return res.status(404).json({ error: "No tasks found for this deal" });
    }

    res.status(200).json(tasks.tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const getTask = async (req, res) => {
  try {
    const { dealId, taskId } = req.params;

    const deal = await Task.findOne({ dealId });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    const task = deal.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const updateTask = async (req, res) => {
  try {
    const { dealId, taskId } = req.params;
    const updates = req.body;

    const deal = await Task.findOneAndUpdate(
      { dealId, "tasks._id": taskId },
      { $set: { "tasks.$": { ...updates, _id: taskId } } },
      { new: true }
    );

    if (!deal) return res.status(404).json({ error: "Task not found" });

    // Emit the updated task to clients in the room for the dealId
    io.to(dealId).emit("taskUpdated", deal);

    res.status(200).json({ message: "Task updated successfully", deal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const deleteTask = async (req, res) => {
  try {
    const { dealId, taskId } = req.params;

    const deal = await Task.findOneAndUpdate(
      { dealId },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );

    if (!deal) return res.status(404).json({ error: "Task not found" });

    // Emit the deletion to clients in the room for the dealId
    io.to(dealId).emit("taskDeleted", deal);

    res.status(200).json({ message: "Task deleted successfully", deal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export { createTask, getTasks, getTask, updateTask, deleteTask };
