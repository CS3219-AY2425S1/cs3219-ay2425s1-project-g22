// Handles the code changes sent by one user and sends them to the other user in the room

import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { roomManager } from '../services/roomManager';
import redis from '../redisClient';

const kafka = new Kafka({
    clientId: 'collab-code-consumer',
    brokers: ['kafka:9092'],
});

const consumer: Consumer = kafka.consumer({ groupId: 'collab-code-group' });

const usersToSocketsKey = 'usersToSockets';

export async function connectCodeConsumer(
  io: any,
): Promise<void> {
    await consumer.connect();
    console.log('Code consumer connected');
    await consumer.subscribe({ topic: 'collab-code', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            if (topic !== 'collab-code') return;
            
            const username = message.key?.toString()!;
            const code: string = JSON.parse(message.value?.toString()!);

            const roomId = await roomManager.getRoomId(username);
            if (!roomId) {
                console.log('User not in a room');
                return;
            }
            await roomManager.updateCode(roomId, code);

            const otherUser = await roomManager.getOtherUser(username);
            const otherUserSocketId = await redis.hget(usersToSocketsKey, otherUser);

            // Send the code change to the other user
            if (otherUserSocketId) {
                console.log(`Sending: ${username} -> ${otherUser}`);
                io.to(otherUserSocketId).emit('code-change', code);
            }
        },
    });
}