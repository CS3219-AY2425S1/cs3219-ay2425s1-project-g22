import { Kafka, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { sendMessage } from './producer.js';
import { convertToQuestions, getQuestionsByFilter, getRandomQuestion } from '../services/questionService.js';
import { Difficulty, Question } from '../models/question.js';

const kafka = new Kafka({
    clientId: 'generate-question-consumer',
    brokers: ['kafka:9092'],
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10,  // Increase retry count here
      initialRetryTime: 3000,  // Time (in ms) before the first retry
      factor: 0.2,  // Factor by which the retry time increases after each attempt
    },
});

const consumer: Consumer = kafka.consumer({ groupId: 'generate-question-group' });

export async function connectQuestionConsumer(
    io: any,
    userSocketMap: Map<string, string>
): Promise<void> { 
    await consumer.connect();
    console.log('Question Consumer connected');

    await consumer.subscribe({ topic: 'generate-question', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            const collabRequest = JSON.parse(message.value?.toString()!);
            const { userId1, userId2, interestTopic, difficulty, language } = collabRequest;
            const topics = [interestTopic];
            const difficultyEnum: Difficulty = difficulty as Difficulty;
            const difficulties = [difficultyEnum];
            const filters = await getQuestionsByFilter(topics, difficulties) || [];
            const questions: Question[] = convertToQuestions(filters);
            const question = getRandomQuestion(questions);
            if (question) {
                console.log("Hello, sending data to collab room.");
                sendMessage('collab-room', { key: 'room', value: {
                    users: [userId1, userId2],
                    question: {
                        questionId: question.questionId.toString(),
                        questionTitle: question.questionTitle,
                        questionDescription: question.questionDescription,
                        questionCategory: question.questionCategory,
                        questionComplexity: question.questionComplexity
                    },
                    language: language
                }});
            // const socketId1 = userSocketMap.get(userId1);
            // const socketId2 = userSocketMap.get(userId2);
            // if (socketId1) {
            //     io.to(socketId1).emit('open-collab-room', true);
            // }
            // if (socketId2) {
            //     io.to(socketId2).emit('open-collab-room', true);
            // }

            
            console.log();
            console.log("---------------------[QUESTION_CONSUMER]----------------------")
            console.log('userId1 = ', userId1);
            console.log('userId2 = ', userId2);
            console.log(question);
            console.log(language);
            console.log('---------------------------------------------------------------------');
            console.log();


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
            }
        },        
    });
}

export async function disconnectQuestionConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Question Consumer disconnected');
}
