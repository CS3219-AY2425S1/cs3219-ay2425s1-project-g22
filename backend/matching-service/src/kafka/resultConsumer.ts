import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { sendMessage } from './producer';

const kafka = new Kafka({
    clientId: 'matching-results-consumer',
    brokers: ['kafka:9092'],
});

const consumer: Consumer = kafka.consumer({ groupId: 'matching-results-group' });

export async function connectResultConsumer(
    io: any,
    userSocketMap: Map<string, string>
): Promise<void> { 
    await consumer.connect();
    console.log('Result Consumer connected');

    await consumer.subscribe({ topic: 'matching-results', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        if (topic === 'matching-results') {
            // console.log({
            //     "[CONSUMER]":
            //     topic,
            //     partition,
            //     key: message.key?.toString(), // Check for possible undefined
            //     value: message.value?.toString(), // Check for possible undefined
            // });
            const matchResult = JSON.parse(message.value?.toString()!);
            
            console.log();
            console.log("---------------------[MATCHING_RESULT_CONSUMER]----------------------")
            console.log(matchResult);
            console.log('---------------------------------------------------------------------');
            console.log();

            const { userId, matchedUserId } = matchResult;
            const socketId1 = userSocketMap.get(userId);
            const socketId2 = userSocketMap.get(matchedUserId);

            console.log(`Sending match result to ${userId} and ${matchedUserId}`);

            if (socketId1) {
                io.to(socketId1).emit('match-result', matchResult);
            }

            const otherMatchResult = matchResult;
            otherMatchResult.userId = matchedUserId;
            otherMatchResult.matchedUserId = userId;

            if (socketId2) {
                io.to(socketId2).emit('match-result', otherMatchResult);
            }

            // sendMessage('collab-room', { key: 'room', value: {
            //     users: [userId, matchedUserId],
            //     question: {
            //         questionId: "1",
            //         questionTitle: "Test Question",
            //         questionDescription: "Test Description",
            //         questionCategory: ["Test"],
            //         questionComplexity: "Easy"
            //     },
            //     language: "python"
            // } }); // FOR DEBUGGING ONLY
        
        }},        
    });
}

export async function disconnectResultConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Result Consumer disconnected');
}
