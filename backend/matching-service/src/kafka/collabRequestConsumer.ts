import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { sendMessage } from './producer';
import redis from '../redisClient';

const kafka = new Kafka({
    clientId: 'collab-request-consumer',
    brokers: ['kafka:9092'],
});

const consumer: Consumer = kafka.consumer({ groupId: 'collab-request-group' });

export async function connectCollabRequestConsumer(
    io: any,
    userSocketMap: Map<string, string>
): Promise<void> { 
    await consumer.connect();
    console.log('Collab Request Consumer connected');

    await consumer.subscribe({ topic: 'collab-request', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          const collabRoomData = JSON.parse(message.value?.toString()!);
          const { userId1, userId2, interestTopic, difficulty, language } = collabRoomData;
          console.log('interestedTopic = ', interestTopic);
          console.log();
          console.log("-----------------------[COLLAB_REQUEST_CONSUMER]----------------------");
          console.log(collabRoomData);
          console.log('---------------------------------------------------------------------');
          console.log();
          generateQuestionForPair(userId1, userId2, interestTopic, difficulty, language);
        }
    });
}

// Sends a message to the question generation service for the pair of users
// Checks if a request is already active for the pair in redis
// Prevents duplicate requests for the same pair
async function generateQuestionForPair(userId1: string, userId2: string, interestTopic: string, difficulty: string, language: string) {
  const sortedUsers = [userId1, userId2].sort();
  const isRequestActive = await redis.get(`generate-question:${sortedUsers[0]}:${sortedUsers[1]}`);
  if (isRequestActive) {
    console.log(`Question request already active for ${sortedUsers[0]} and ${sortedUsers[1]}`);
    return;
  }

  await redis.set(`generate-question:${sortedUsers[0]}:${sortedUsers[1]}`, 'true', 'EX', 15); // 15 seconds expiry

  sendMessage('generate-question', { 
    key: 'generate-question', 
    value: {
      userId1: userId1,
      userId2: userId2,
      interestTopic: interestTopic,
      difficulty: difficulty,
      language: language
    }
  });
}

export async function disconnectCollabRequestConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Collab Request Consumer disconnected');
}
