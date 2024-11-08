import { MatchRequest } from '../models/matchRequest';
import { Queue } from '../dataStructures/queue';

export class MatchingPools {
    topicPools: Map<string, Queue<MatchRequest>> = new Map();

    // Singleton pattern as we want only one instance of MatchingPools
    private static instance: MatchingPools;
    private constructor() {}
    public static getInstance(): MatchingPools {
        if (!MatchingPools.instance) {
            MatchingPools.instance = new MatchingPools();
        }
        return MatchingPools.instance;
    }
    // Function to log the contents of the Map
    logTopicPools() {
        this.topicPools.forEach((queue, topic) => {
            console.log(`[Topic Queue]: ${topic}`);
            console.log(`[Queue Contents]: ${queue.viewItems()}`);
            console.log();
        });
    }

    enqueueMatchRequest(matchRequest: MatchRequest): void {
      // Add to topic pools
        for (const topic of matchRequest.topics) {
            if (!this.topicPools.has(topic)) {
                this.topicPools.set(topic, new Queue<MatchRequest>());
            }
            this.topicPools.get(topic)!.enqueue(matchRequest);
        }
        console.log('------------Matching Pools After Enqueue New Match Request-----------');
        this.logTopicPools();
        console.log('---------------------------------------------------------------------');
        console.log();

    }

    removeMatchRequest(matchRequest: MatchRequest): void {
      if (!matchRequest) {
        return;
      }

      // Remove from topic Pools
        for (const topic of matchRequest.topics) {
            const pool = this.topicPools.get(topic);
            if (pool) {
                pool.remove(matchRequest);
                if (pool.isEmpty()) {
                    this.topicPools.delete(topic);
                }
            }
        }
        console.log('--------------Matching Pools After Remove Match Request--------------');
        this.logTopicPools();
        console.log('---------------------------------------------------------------------');
        console.log();

    }

    findMatchRequestInTopicPools(userId: string, topics: string[]): MatchRequest | null {
        //console.log(this.topicPools)
        for (const topic of topics) {
            const pool = this.topicPools.get(topic);
            if (pool) {
                for (const item of pool.toArray()) {  // Use getItems() to retrieve the array of items
                    if (item.userId === userId) {
                        return item;
                    }
                }
            }
        }
        return null; // Return null if no matching MatchRequest is found
    }

    removeMatchRequestByUserId(userId: string): void {
        // Function to find and remove match requests by userId
        const removeFromPool = (poolMap: Map<string, Queue<MatchRequest>>) => {
            for (const [key, pool] of poolMap.entries()) {
                pool.removeIf(matchRequest => matchRequest.userId === userId);
                if (pool.isEmpty()) {
                    poolMap.delete(key);
                }
            }
        };
    
        // Remove from topic Pools
        removeFromPool(this.topicPools);
    
        console.log('--------------Matching Pools After Remove Match Request--------------');
        this.logTopicPools();
        console.log('---------------------------------------------------------------------');
        console.log();
    }
}