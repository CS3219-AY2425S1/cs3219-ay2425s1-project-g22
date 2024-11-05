import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData as getQuestion } from '../services/questionService';
import { Container, Card, Button } from 'react-bootstrap';
import { Cog6ToothIcon, TagIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import './QuestionDetails.css'; 

const QuestionDetails = () => {
  const { id } = useParams(); // Get the question ID from the URL params
  const [question, setQuestion] = useState(null);
  const navigate = useNavigate();
  const colorSets = [
    { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-600/10' },
    { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-600/10' },
    { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-600/10' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-600/10' },
    { bg: 'bg-pink-100', text: 'text-pink-800', ring: 'ring-pink-600/10' },
  ];

  // Randomly select a color set for each category
  const getRandomColorSet = () => colorSets[Math.floor(Math.random() * colorSets.length)];

   // Get color classes based on complexity
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

  // Fetch the selected question from the API or state
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const questions = await getQuestion(); // Fetch all questions
        const selectedQuestion = questions.find((q) => q.id === id); // Find the question by ID
        setQuestion(selectedQuestion);
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    };
    fetchQuestionDetails();
  }, [id]);

  // If no question is found, show a message
  if (!question) {
    return (
      <Container>
        <h3>Question not found</h3>
        <Button onClick={() => navigate('/questions')}>Back to List</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body className='ml-4 mt-3'>
          <Card.Title className='mb-4 flex items-center'> 
            {question.title}
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
          </Card.Title>
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
         
          <Card.Text>
            <ReactMarkdown>{question.desc}</ReactMarkdown>
          </Card.Text>

          <button 
            className="mt-5 mb-4 px-4 py-2 bg-blue-500 text-white rounded-2xl font-semibold
                       hover:bg-blue-700"
            onClick={() => navigate('/questions')}
          >
            Back to list
          </button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuestionDetails;

