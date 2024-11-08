import React, { useEffect, useState } from 'react';
import { getData as getQuestion } from '../services/questionService';
import { Cog6ToothIcon, TagIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';


const QuestionDetails = ({ questionId, theme }) => {
  const [question, setQuestion] = useState(null);

  const colorSets = [
    { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-600/10' },
    { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-600/10' },
    { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-600/10' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-600/10' },
    { bg: 'bg-pink-100', text: 'text-pink-800', ring: 'ring-pink-600/10' },
  ];

  const getRandomColorSet = () => colorSets[Math.floor(Math.random() * colorSets.length)];

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'easy':
        return { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-600/10' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-600/10' };
      case 'hard':
        return { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-600/10' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-600/10' };
    }
  };

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const questions = await getQuestion();
        const selectedQuestion = questions.find((q) => q.id === questionId);
        setQuestion(selectedQuestion);
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    };
    fetchQuestionDetails();
  }, [questionId]);

  if (!question) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Question not found</h3>
      </div>
    );
  }


  const containerStyles = theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-black';

  return (
    <div className={`p-6 m-4 rounded-lg border ${containerStyles}`}>
      <div className="mb-4 flex items-center">
        <h2 className="text-3xl font-bold">{question.title}</h2>
        {(() => {
          const { bg, text, ring } = getComplexityColor(question.d);
          return (
            <span
              className={`ml-4 inline-flex items-center rounded-full ${bg} px-2 py-1 text-xs font-medium ${text} ring-1 ring-inset ${ring}`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-1" /> <span>{question.d}</span>
            </span>
          );
        })()}
      </div>
      <div className="flex items-center mb-4">
        <span className="text-sm font-medium text-gray-500 flex items-center mr-5">
          <TagIcon className="h-5 w-5 mr-2" /> Topics:
        </span>
        <span className="text-sm text-gray-900">
          {question.c.map((category, index) => {
            const { bg, text, ring } = getRandomColorSet();
            return (
              <span
                key={index}
                className={`inline-flex items-center rounded-full ${bg} px-2 py-1 text-xs font-medium ${text} ring-1 ring-inset ${ring} mr-1`}
              >
                {category}
              </span>
            );
          })}
        </span>
      </div>
      <div className="text-gray-700 dark:text-gray-300">
        <ReactMarkdown>{question.desc}</ReactMarkdown>
      </div>
    </div>
  );
};

export default QuestionDetails;