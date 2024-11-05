export interface RoomTopicMessage {
  users: [string, string]
  question: QuestionDetails
  language: string
}

export interface QuestionDetails {
  questionId: string;
  questionTitle: string;
  questionDescription: string;
  questionCategory: string[];
  questionComplexity: string;
}

