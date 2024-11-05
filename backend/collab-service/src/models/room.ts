// Class which manages the rooms and users in the rooms

import { QuestionDetails } from "../types";
import { getTemplate } from "../utils/codeTemplates";

export default class Room {
  public users: [string, string];
  public question: QuestionDetails;
  public code: string;
  public language: string;

  constructor(users: [string, string], question: QuestionDetails, language: string) {
    language = language.toLowerCase();

    this.users = users;
    this.question = question;
    this.code = getTemplate(language);
    this.language = language;
  }
}