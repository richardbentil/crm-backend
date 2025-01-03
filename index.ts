import express from 'express';
import cors from "cors";
import { config } from 'dotenv';
import compression from 'compression';
import http from "http";
import { Server } from "socket.io";
import { swaggerSpec, swaggerUi } from "./swagger";
import rateLimit from "express-rate-limit";

import contactRoutes from "./routes/contactRoutes";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import dealRoutes from "./routes/dealRoutes";
import emailRoutes from "./routes/emailRoutes";
import reportRoutes from "./routes/reportRoutes";
import userRoutes from "./routes/userRoutes";
import importExportRoutes from "./routes/importExportRoutes";
import paymentRoutes from "./routes/paymentsRoutes";
import emailTemplateRoutes from "./routes/EmailTemplateRoutes";
import noteRoutes from "./routes/noteRoutes";
import messagesRoutes from "./routes/chatMessageRoute";
import errorHandler from './middlewares/errorHandler';
import connectToDatabase from './config/mongodb';


const app = express();
config();
const PORT = 5000;

const server = http.createServer(app);

const io = new Server(server); // Initialize socket.io on the server

export { io }; // Export the 'io' instance for use in other files

// Connect to the database
connectToDatabase();

const corsOptions = {
    origin: '*', // Restrict to a specific frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

app.use(express.json());
app.use(cors(corsOptions));
app.use(compression()); // Compression for mobile browsers
app.use(limiter);

// Listen for connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a room for a specific task (for example, with task ID)
  socket.on("joinTask", (taskId) => {
    socket.join(taskId); // Now the user is part of this task's room
  });

  // Listen for task updates
  socket.on("taskUpdate", (taskData) => {
    // Emit the update to the specific task's room, not globally
    io.to(taskData.taskId).emit("taskUpdated", taskData);
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("message", (data) => {
    io.to(data.room).emit("message", data);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/data", importExportRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/email-template", emailTemplateRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/messages", messagesRoutes);

app.use(errorHandler)

// Start the server
server.listen(PORT, () => {
    console.log("listening on port", PORT);
});
