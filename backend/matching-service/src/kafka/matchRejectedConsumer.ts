import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'match-rejected-consumer',
    brokers: ['kafka:9092'],
});

const consumer: Consumer = kafka.consumer({ groupId: 'match-rejected-group' });

export async function connectMatchRejectedConsumer(
    io: any,
    userSocketMap: Map<string, string>
): Promise<void> { 
    await consumer.connect();
    console.log('Match Rejected Consumer connected');

    await consumer.subscribe({ topic: 'match-rejected', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        const matchRejectedData = JSON.parse(message.value?.toString()!);
        const { userId, matchedUserId } = matchRejectedData;
        const socketId = userSocketMap.get(matchedUserId);
        if (socketId) {
            console.log('inside match reject socket, Telling matched user, acceptance update')
            io.to(socketId).emit('matched-user-acceptance-update', {
                userId: userId,
                isAccepted: false
            });
        }
        console.log();
        console.log("-----------------------[MATCH_REJECTED_CONSUMER]----------------------");
        console.log(matchRejectedData);
        console.log('userId:', userId);
        console.log('matchedUserId:', matchedUserId);
        console.log('---------------------------------------------------------------------');
        console.log();

        }
    });
}

export async function disconnectMatchRejectedConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Match Rejected Consumer disconnected');
}
