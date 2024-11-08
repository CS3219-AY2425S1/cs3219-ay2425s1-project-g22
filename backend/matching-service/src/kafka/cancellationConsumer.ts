import { Kafka, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { Difficulty, MatchRequest, MatchStatus } from '../models/matchRequest';
import { MatchingPools } from '../services/matchingPools';
import redis from '../redisClient';

const kafka = new Kafka({
    clientId: 'match-cancellation-consumer',
    brokers: ['kafka:9092'],
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10,  // Increase retry count here
      initialRetryTime: 3000,  // Time (in ms) before the first retry
      factor: 0.2,  // Factor by which the retry time increases after each attempt
    },
});

const consumer: Consumer = kafka.consumer({ groupId: 'matching-cancellation-group' });

export async function connectCancellationConsumer(io: any): Promise<void> { 
    await consumer.connect();
    console.log('Match Cancellation Consumer connected');

    await consumer.subscribe({ topic: 'match-canceled', fromBeginning: true });
    const matchingPools = MatchingPools.getInstance();
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          const matchRequestData: Partial<MatchRequest> = JSON.parse(
              message.value?.toString()!
          ); 
          const canceledMatchRequest: MatchRequest = {
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
              status: MatchStatus.Cancelled,
          };
            
          const userId = canceledMatchRequest.userId;
          const matchRequest = matchingPools.findMatchRequestInTopicPools(userId, canceledMatchRequest.topics)!;

          //console.log(matchRequest);
          if (matchRequest) {
              matchingPools.removeMatchRequest(matchRequest);
              matchRequest.status = MatchStatus.Cancelled;
              console.log();
              console.log("-----------------------[CANCEL_MATCH_CONSUMER]-----------------------")
              console.log(matchRequest);
              console.log('---------------------------------------------------------------------');
              console.log();
          } else {
            console.log();
            //console.log('Cancelling on non-existent match request');
          }          

        },
    });
}

export async function disconnectCancellationConsumer(): Promise<void> {
    await consumer.disconnect();
    console.log('Match Cancellation Consumer disconnected');
}
