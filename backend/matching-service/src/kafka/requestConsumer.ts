import { Kafka, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { Difficulty, MatchRequest, MatchStatus } from '../models/matchRequest';
import { attemptMatch } from '../services/matchingService';
import { MatchingPools } from '../services/matchingPools';
import { connectProducer, sendMessage } from './producer';
import redis from '../redisClient';

const kafka = new Kafka({
    clientId: 'matching-service-consumer',
    brokers: ['kafka:9092'],
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10,  // Increase retry count here
      initialRetryTime: 3000,  // Time (in ms) before the first retry
      factor: 0.2,  // Factor by which the retry time increases after each attempt
    },
});

const consumer: Consumer = kafka.consumer({ groupId: 'matching-service-group' });
  
export async function connectRequestConsumer(io: any): Promise<void> {
    await consumer.connect();
    console.log('Match Request Consumer connected');
    
    await consumer.subscribe({ topic: 'matching-requests', fromBeginning: true });
    const matchingPools = MatchingPools.getInstance();
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        if (topic === 'matching-requests') {
          const matchRequestData: Partial<MatchRequest> = JSON.parse(
            message.value?.toString()!
          );
        
          const matchRequest: MatchRequest = {
            userId: matchRequestData.userId!,
            topics: Array.isArray(matchRequestData.topics) ? matchRequestData.topics : [],
            difficulties: Array.isArray(matchRequestData.difficulties) ? matchRequestData.difficulties.map((difficulty: string) => {
              switch (difficulty) {
                case 'easy':
                  return Difficulty.Easy;
                case 'medium':
                  return Difficulty.Medium;
                case 'hard':
                  return Difficulty.Hard;
                default:
                  throw new Error('Invalid difficulty');
              }
            }) : [],
            languages: Array.isArray(matchRequestData.languages) ? matchRequestData.languages : [],
            requestTime: typeof matchRequestData.requestTime === 'number' ? matchRequestData.requestTime : Date.now(),
            status: MatchStatus.Finding,
          };
          console.log();
          console.log("--------------------[MATCHING_REQUEST_CONSUMER]----------------------")
          console.log(matchRequest);
          console.log('---------------------------------------------------------------------');
          console.log();
          // Enqueue the UserRequest into the matching pools
          matchingPools.enqueueMatchRequest(matchRequest);
  
          // Attempt to find a match
          attemptMatch(matchRequest);
  
        }
      },
    });
  }

export async function disconnectRequestConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Request Consumer disconnected');
}
