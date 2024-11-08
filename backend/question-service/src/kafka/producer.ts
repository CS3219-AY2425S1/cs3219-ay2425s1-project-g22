import { Kafka, Producer, logLevel } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'question-service-producer',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
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
    console.log('Question Producer connected');
}

export async function sendMessage(topic: string, message: { key: string; value: any }): Promise<void> {
    const result = await producer.send({
        topic,
        messages: [{ key: message.key, value: JSON.stringify(message.value) }],
    });
    console.log(`Sent message: ${JSON.stringify(result)}`);
}

export async function disconnectProducer(): Promise<void> {
    await producer.disconnect();
    console.log('Producer disconnected');
}
