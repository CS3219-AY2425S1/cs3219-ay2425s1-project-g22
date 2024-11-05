export interface CollabRequest {
    userId1: string;
    userId2: string;
    topic: string;
    difficulty: Difficulty;
    language: string;
}

export enum Difficulty {
    Easy = "easy",
    Medium = "medium",
    Hard = "hard",
}
  