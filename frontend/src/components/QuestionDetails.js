// src/components/QuestionDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData as getQuestion } from '../services/questionService';
import { Container, Card, Button } from 'react-bootstrap';
import './QuestionDetails.css'; 
import DOMPurify from 'dompurify';

const createMarkup = (html) => {
  return { __html: DOMPurify.sanitize(html) };
};

const QuestionDetails = () => {
  const { id } = useParams(); // Get the question ID from the URL params
  const [question, setQuestion] = useState(null);
  const navigate = useNavigate();

  // Fetch the selected question from the API or state
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const existingQuestion = await getQuestion(`/${id}`); // Fetch specific question
        if (existingQuestion) {
          setQuestion({
            title: existingQuestion.title,
            description: existingQuestion.desc,  // Mapping 'desc' to 'description'
            categories: existingQuestion.c,      // Mapping 'c' to 'categories'
            complexity: existingQuestion.d,      // Mapping 'd' to 'complexity'
          });
        }
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
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{question.title}</Card.Title>
          
          {/* Render Description with Rich Text */}
          <Card.Text>
            <strong>Description: </strong>
            <div dangerouslySetInnerHTML={createMarkup(question.description)} />
          </Card.Text>

          {/* Render Categories */}
          <Card.Text>
            <strong>Category: </strong>{question.categories.join(', ')}
          </Card.Text>

          {/* Render Complexity */}
          <Card.Text>
            <strong>Complexity: </strong>{question.complexity}
          </Card.Text>

          <Button variant="primary" onClick={() => navigate('/questions')}>
            Back to List
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuestionDetails;
