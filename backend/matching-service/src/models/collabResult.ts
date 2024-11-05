export interface CollabResult {
    userId1: string;
    userId2: string;
    question: Question;
}

export interface Question {
    questionId: string;
    questionTitle: string;
    questionDescription: string;
    questionCategory: string[];
    questionComplexity: Difficulty;
}
  
export enum Difficulty {
    Easy = "easy",
    Medium = "medium",
    Hard = "hard",
}
  