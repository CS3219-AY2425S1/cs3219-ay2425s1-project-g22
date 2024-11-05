import { connectToDatabase } from '../config/database.js';
import { Question } from '../models/question.js';
import { ObjectId } from 'mongodb';
import { Difficulty } from '../models/question.js';

// Add a new question
export async function addQuestion(question: Omit<Question, 'questionId'>) {
    const db = await connectToDatabase();
    const collection = db.collection('questions');
    const result = await collection.insertOne({ question });
    console.log('Question inserted with _id:', result.insertedId);
    return result.insertedId;
}

// Read a question by ID
export async function getQuestionById(questionId: ObjectId) {
    const db = await connectToDatabase();
    const collection = db.collection('questions');
    const question = await collection.findOne({ _id: questionId });

    if (!question) {
      return null;
    }

    console.log(question)

    return {
      "id": question._id,
      "title": question.question.questionTitle,
      "desc": question.question.questionDescription,
      "c": question.question.questionCategory,
      "d": question.question.questionComplexity
    }
}

// Get questions filtered by category and difficulty
export async function getQuestionsByFilter(categories?: string[], difficulties?: Difficulty[]) {
  const db = await connectToDatabase();
  const collection = db.collection('questions');

  const filter: { [key: string]: any } = {};
  if (categories) {
      filter['question.questionCategory'] = { 
        $elemMatch: {
          $in: categories.map(category => new RegExp(`^${category}$`, 'i')) // Case insensitive match
        }
      };
  }
  if (difficulties) {
      filter['question.questionComplexity'] = { 
        $in: difficulties.map(difficulty => new RegExp(`^${difficulty}$`, 'i')) // Case insensitive match
      };
  }

  const questions = await collection.find(filter).toArray();

  if (!questions || questions.length === 0) {
    return null;
  }

  return questions.map(question => {
    return {
      "id": question._id,
      "title": question.question.questionTitle,
      "desc": question.question.questionDescription,
      "c": question.question.questionCategory,
      "d": question.question.questionComplexity
    }
  });
}

// Function to convert raw data to Question[]
export function convertToQuestions(rawData: any[]): Question[] {
  return rawData.map(data => ({
    questionId: data.id, // Assuming `id` is the ObjectId
    questionTitle: data.title,
    questionDescription: data.desc,
    questionCategory: data.c,
    questionComplexity: data.d as Difficulty // Type assertion if necessary
  }));
}

// Function to get a random question from an array of questions
export function getRandomQuestion(questions: Question[]): Question | null {
  if (!questions || questions.length === 0) {
    console.log('No questions available for the given filters.');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}


// Update a question by ID, only the fields that are provided in the updatedQuestion object will be updated
export async function updateQuestion(questionId: ObjectId, updatedQuestion: Partial<Question>) {
  const db = await connectToDatabase();
  const collection = db.collection('questions');

  // Retrieve the current question document
  const currentQuestion = await collection.findOne({ _id: questionId });
  
  if (!currentQuestion) {
      throw new Error('Question not found');
  }

  // Prepare the update object
  const updateData = {
      question: {
          questionTitle: updatedQuestion.questionTitle || currentQuestion.question.questionTitle,
          questionDescription: updatedQuestion.questionDescription || currentQuestion.question.questionDescription,
          questionCategory: updatedQuestion.questionCategory || currentQuestion.question.questionCategory,
          questionComplexity: updatedQuestion.questionComplexity || currentQuestion.question.questionComplexity
      }
  };

  // Perform the update operation
  const result = await collection.updateOne({ _id: questionId }, { $set: updateData });
  return result.modifiedCount > 0;
}

// Delete a question by ID
export async function deleteQuestion(questionId: ObjectId) {
    const db = await connectToDatabase();
    const collection = db.collection('questions');
    const result = await collection.deleteOne({ _id: questionId });
    return result.deletedCount > 0;
}