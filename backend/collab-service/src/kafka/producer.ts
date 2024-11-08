import { Kafka, Producer, logLevel } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'collab-service-producer',
    brokers: ['kafka:9092'],
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10,  // Increase retry count here
      initialRetryTime: 3000,  // Time (in ms) before the first retry
      factor: 0.2,  // Factor by which the retry time increases after each attempt
    },
});

const producer: Producer = kafka.producer();

export async function connectProducer(): Promise<void> {
    await producer.connect();
    console.log('Producer connected');
}

export async function sendCodeMessage(topic: string, message: { key: string; value: any }): Promise<void> {
    const result = await producer.send({
        topic,
        messages: [{ key: message.key, value: JSON.stringify(message.value) }],
    });
    console.log(`Sent message: ${JSON.stringify(result)}`);
}

export async function sendChatMessage(topic: string, message: { key: string; value: string }): Promise<void> {
    const result = await producer.send({
        topic,
        messages: [{ key: message.key, value: message.value }],
    });
    console.log(`Sent chat message: ${JSON.stringify(result)}`);
}

export async function disconnectProducer(): Promise<void> {
    await producer.disconnect();
    console.log('Producer disconnected');
}
