import { io } from "..";
import Task from "../models/Task";

const createTask = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTasks = async (req: any, res: any) => {
  try {
    const { search, status } = req.query;

    const query: any = {
      createdBy: req.user.id,
    };

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(query).populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const tasks = await Task.findById(id)
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updates,
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    // Emit task update only to the room (task) associated with the task ID
    io.to(task._id.toString()).emit("taskUpdated", task);

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, createdBy: req.user.id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { createTask, getTasks, getTask, updateTask, deleteTask };
