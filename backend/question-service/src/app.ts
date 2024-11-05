import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import router from "./routes/routes.js";
import cors from 'cors';
import { connectToDatabase } from './config/database.js';

import { connectProducer, sendMessage } from './kafka/producer.js';
import { connectQuestionConsumer } from './kafka/questionConsumer.js';

const app = express();
const port = process.env.PORT || 8080;
// create HTTP server
const httpServer = createServer(app);

// Initialise Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Update this to match your frontend port
    methods: ["GET", "POST"]
  }
});

// Map to store the user ID and socket ID
// enables the server to send messages to specific users
const userSocketMap = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('A user connected to socket:', socket.id);

  // Register user with their socket ID
  socket.on('register', (userId: string) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
  });

  // Handle disconnections
  // clean up the userSocketMap when a client disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from the map
    for (const [userId, sId] of userSocketMap.entries()) {
      if (sId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

async function startServer() {
  try {
    await connectProducer();

    await connectQuestionConsumer(io, userSocketMap);
    const db = await connectToDatabase();
    // You can now use `db` to interact with your MongoDB database
    app.use(cors());
    app.use(express.json());
    app.use("/api/questions", router);

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
  }
}

startServer();
