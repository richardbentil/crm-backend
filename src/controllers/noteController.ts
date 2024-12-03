import { io } from "..";
import Note from "../models/Note";

const createNote = async (req, res) => {
  try {
    const { content, taskId } = req.body;

    const note = await Note.create({
      taskId,
      content,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Note created successfully", note });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getNote = async (req: any, res: any) => {
  try {
    const tasks = await Note.find()
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updates,
      { new: true }
    );

    if (!note) return res.status(404).json({ error: "Task not found" });

    // Emit task update only to the room (task) associated with the task ID
    io.to(note._id.toString()).emit("noteUpdated", note);

    res.status(200).json({ message: "Note updated successfully", note });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Note.findOneAndDelete({ _id: id, createdBy: req.user.id });
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { createNote, getNote, updateNote, deleteNote };
