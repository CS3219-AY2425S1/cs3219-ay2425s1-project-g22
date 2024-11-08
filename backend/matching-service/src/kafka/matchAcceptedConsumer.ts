import { Kafka, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import redis from '../redisClient'; 

const kafka = new Kafka({
    clientId: 'match-accepted-consumer',
    brokers: ['kafka:9092'],
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10,  // Increase retry count here
      initialRetryTime: 3000,  // Time (in ms) before the first retry
      factor: 0.2,  // Factor by which the retry time increases after each attempt
    },
});

const consumer: Consumer = kafka.consumer({ groupId: 'match-accepted-group' });

const usersToSocketsKey = 'matchingService-usersToSockets';

export async function connectMatchAcceptedConsumer(io: any): Promise<void> { 
    await consumer.connect();
    console.log('Match Accepted Consumer connected');

    await consumer.subscribe({ topic: 'match-accepted', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            const matchAcceptedData = JSON.parse(message.value?.toString()!);
            const { userId, matchedUserId } = matchAcceptedData;

            const socketId = await redis.hget(usersToSocketsKey, matchedUserId);
            if (socketId) {
                io.to(socketId).emit('matched-user-acceptance-update', {
                    userId: userId,
                    isAccepted: true
                });
            }
            console.log();
            console.log("-----------------------[MATCH_ACCEPTED_CONSUMER]----------------------");
            console.log(matchAcceptedData);
            console.log('userId:', userId);
            console.log('matchedUserId:', matchedUserId);
            console.log('---------------------------------------------------------------------');
            console.log();
        }
    });
}

export async function disconnectMatchAcceptedConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Match Accepted Consumer disconnected');
}
