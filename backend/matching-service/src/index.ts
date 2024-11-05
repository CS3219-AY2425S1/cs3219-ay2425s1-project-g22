import { Server } from 'socket.io';
import { createServer } from 'http';
import { MatchRequest } from './models/matchRequest';
import { connectProducer, sendMessage } from './kafka/producer';
import { connectRequestConsumer } from './kafka/requestConsumer';
import { connectResultConsumer } from './kafka/resultConsumer';
import { connectTimeoutConsumer } from './kafka/timeoutConsumer';
import { connectCancellationConsumer } from './kafka/cancellationConsumer';
import { connectCollabRequestConsumer } from './kafka/collabRequestConsumer';
import { connectMatchAcceptedConsumer } from './kafka/matchAcceptedConsumer';
import { connectMatchRejectedConsumer } from './kafka/matchRejectedConsumer';
import { adminInit } from './kafka/admin';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from 'tls';

const app = express();
app.use(cors());

dotenv.config();

const kafkaBrokers = process.env.KAFKA_BROKERS 
  ? process.env.KAFKA_BROKERS.split(',') 
  : ['kafka:9092'];

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

  // Handle matching requests
  socket.on('matching-request', async (matchRequest: MatchRequest) => {
    // Process the matching request
    // For example, send it to Kafka topic 'matching-requests'
    // You'll need to implement sendMessage in your producer
    await sendMessage('matching-requests', { key: matchRequest.userId, value: matchRequest});
  });

  // Handle match cancellation
  socket.on('match-cancel', async (matchRequest: MatchRequest) => {
    await sendMessage('match-canceled', { key: matchRequest.userId, value: matchRequest});
  });

  socket.on('acceptance-status', async (acceptanceStatus) => {
    const { userId, isAccepted, matchedUserId } = acceptanceStatus;

    console.log();
    console.log('----------------------inside acceptance-status socket-----------------------')
    console.log('testing userId = ', userId);
    console.log('testing isAccepted = ', isAccepted);
    console.log('testing matchedUserId = ', matchedUserId);

    console.log('testing acceptance.userId = ', acceptanceStatus.userId);
    console.log('testing acceptance.isAccepted = ', acceptanceStatus.isAccepted);
    console.log('testing acceptance.matchedUserId = ', acceptanceStatus.matchedUserId);
    console.log('----------------------------------------------------------------------------')
    console.log();

    if (acceptanceStatus.isAccepted) {
      await sendMessage('match-accepted', { key: acceptanceStatus.userId, value: { userId, matchedUserId } });
    } else {
      await sendMessage('match-rejected', { key: acceptanceStatus.userId, value: { userId, matchedUserId } });
    }
  });

  socket.on('collab-room-data', async (collabData) => {
    const { userId1, userId2, interestTopic, difficulty, language } = collabData;
    await sendMessage('collab-request', { key: userId1, value: { userId1, userId2, interestTopic, difficulty, language } });
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

// Function to start the server
const startServer = async () => {
  try {
    adminInit().catch(console.error);
    // Connect to Kafka producer
    await connectProducer();

    // Start the Kafka consumers and matching service
    await connectRequestConsumer(io, userSocketMap);
    await connectResultConsumer(io, userSocketMap);
    await connectCancellationConsumer(io, userSocketMap);
    await connectTimeoutConsumer(io, userSocketMap);
    await connectCollabRequestConsumer(io, userSocketMap);
    await connectMatchAcceptedConsumer(io, userSocketMap);
    await connectMatchRejectedConsumer(io, userSocketMap);
  
    // Start the WebSocket server
    const PORT = 8081;
    httpServer.listen(PORT, () => {
      console.log('Matching service is running on port', PORT);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
};

startServer();