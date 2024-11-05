import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { getData, deleteData } from "../services/questionService";
import { Cog6ToothIcon, TagIcon } from '@heroicons/react/24/solid';
import './QuestionList.css'; // Custom CSS for QuestionList

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
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


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getData("/");
        setQuestions(response);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);
  		
  const deleteQuestion = async (id) => {
    try {
        await deleteData(`/${id}`);
        const updatedQuestions = questions.filter((q) => q.id !== id);
        setQuestions(updatedQuestions);
    } catch (error) {
        console.error("Error deleting question:", error);
    }
  };

  const handleQuestionClick = (id) => {
	  navigate(`/questions/${id}`);
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Question Repository</h2>
      <Link 
        to="/questions/add" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-2xl no-underline">
        Add New Question
      </Link>
      <Row className='mt-5'>
        {questions.map((question) => (
          <Col md={4} key={question.id} className="mb-4">
            <Card className="question-card shadow-sm" onClick={() => handleQuestionClick(question.id)}>
              <Card.Body>
                <div className='font-semibold mb-2 text-xl'>{question.title}</div>
                <div className='mb-3'>
                  {(() => {
                    const { bg, text, ring } = getComplexityColor(question.d);
                    return (
                      <span
                        className={`inline-flex items-center rounded-full ${bg} px-2 py-1 text-xs font-medium ${text} ring-1 ring-inset ${ring}`}
                      >
                      <Cog6ToothIcon className="h-5 w-5 mr-1" /> <span>{question.d}</span>
                      </span>
                    );
                  })()}
                </div>
                
                <Card.Text><strong>Topics:</strong> {question.c.join(', ')}</Card.Text>
                  
                <div className="d-flex justify-content-between mt-4 mb-2">
                  <Button variant="outline-primary" as={Link} to={`/questions/edit/${question.id}`} onClick={(e) => e.stopPropagation()}>Edit</Button>
                  <Button variant="outline-danger" onClick={(e) => {e.stopPropagation(); deleteQuestion(question.id)}}>Delete</Button>
               
                  {/* <button 
                    className="px-4 py-1 ring-1 ring-inset ring-blue-500 text-blue-500 rounded-xl font-normal hover:bg-blue-500 hover:text-white transition-colors duration-200"
                    as={Link} 
                    to={`/questions/edit/${question.id}`} 
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </button>

                  <button 
                    className="px-4 py-1 ring-1 ring-inset ring-red-500 text-red-500 rounded-lg font-normal hover:bg-red-500 hover:text-white transition-colors duration-200"
                    onClick={(e) => {e.stopPropagation(); deleteQuestion(question.id)}}
                  >
                    Delete
                  </button> */}
                  
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
   );
};
export default QuestionList;
