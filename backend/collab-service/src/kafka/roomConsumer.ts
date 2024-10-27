// Receives message from matching-service to create a room
// Creates a room with the two given users.

import { EachMessagePayload, Kafka } from "kafkajs";
import { roomManager } from "../models/room";

const kafka = new Kafka({
  clientId: 'collab-room-consumer',
  brokers: ['kafka:9092'],
})

const consumer = kafka.consumer({ groupId: 'collab-room-group' });

export async function connectRoomConsumer(): Promise<void> {
  await consumer.connect();
  console.log('Room consumer connected');
  await consumer.subscribe({ topic: 'collab-room', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      if (topic != 'collab-room') return;

      const users: string[] = JSON.parse(message.value?.toString()!);
      console.log('Creating a room for users:', users);
      
      roomManager.createRoom(users);
    },
  });
}