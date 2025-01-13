import { io } from "..";
import Task from "../models/Task";

const createTask = async (req, res, next) => {
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
    next({
      status: 500,
      message: err.message,
  })
  }
};

const getTasks = async (req, res, next) => {
  const { search = "", page = 1, limit = 10, dealId } = req.query;

  // Convert page and limit to numbers and set defaults if invalid
  const pageNumber = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
  const limitNumber = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1
  const skip = (pageNumber - 1) * limitNumber;

  try {
    // Build the filter
    const filter: any = {};
    if (dealId) {
      filter.dealId = dealId;
    }
    if (search) {
      filter["tasks.title"] = { $regex: search, $options: "i" }; // Case-insensitive search on task title
    }

    // Fetch tasks with pagination and filtering
    const tasks = await Task.find(filter)
      .populate("tasks.createdBy tasks.assignedTo", "name email")
      .skip(skip)
      .limit(limitNumber);

    const totalTasks = await Task.countDocuments(filter); // Total matching tasks
    const totalPages = Math.ceil(totalTasks / limitNumber);

    if (!tasks.length) {
      return res.status(404).json({ error: "No tasks found" });
    }

    res.status(200).json({
      currentPage: pageNumber,
      totalPages,
      totalTasks,
      limit: limitNumber,
      data: tasks,
    });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
    });
  }
};



const getTask = async (req, res, next) => {
  try {
    const { dealId, taskId } = req.params;

    const deal = await Task.findOne({ dealId });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    const task = deal.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.status(200).json(task);
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};


const updateTask = async (req, res, next) => {
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
    next({
      status: 500,
      message: err.message,
  })
  }
};


const deleteTask = async (req, res, next) => {
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
    next({
      status: 500,
      message: err.message,
  })
  }
};


export { createTask, getTasks, getTask, updateTask, deleteTask };
