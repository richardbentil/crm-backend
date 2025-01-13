import { io } from "..";
import Note from "../models/Note";


const createNote = async (req, res, next) => {
  try {
    const { content, heading, taskId, dealId } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { taskId },
      {
        $push: {
          notes: {
            heading,
            content,
            createdBy: req.user.id,
          },
        },
      },
      { new: true, upsert: true } // Create document if it doesn't exist
    );

    // Emit the new note to clients in the room for the taskId
    io.to(taskId).emit("noteAdded", updatedNote);

    res.status(201).json({ message: "Note created successfully", updatedNote });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};

const getNote = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const notes = await Note.findOne({ taskId }).populate("notes.createdBy", "name email");

    if (!notes) {
      return res.status(404).json({ error: "No notes found for this task" });
    }

    res.status(200).json(notes.notes);
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};


const updateNote = async (req, res, next) => {
  try {
    const { taskId, noteId } = req.body;
    const { content } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { taskId, "notes._id": noteId },
      {
        $set: { "notes.$.content": content },
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Emit the updated note to clients in the room for the taskId
    io.to(taskId).emit("noteUpdated", updatedNote);

    res.status(200).json({ message: "Note updated successfully", updatedNote });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};


const deleteNote = async (req, res, next) => {
  try {
    const { taskId, noteId } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { taskId },
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Emit the deletion to clients in the room for the taskId
    io.to(taskId).emit("noteDeleted", updatedNote);

    res.status(200).json({ message: "Note deleted successfully", updatedNote });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
  })
  }
};


export { createNote, getNote, updateNote, deleteNote };
