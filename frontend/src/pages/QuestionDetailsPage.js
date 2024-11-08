import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionDetails from '../components/QuestionDetails';
import { Button, Container } from 'react-bootstrap';

const QuestionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
        <Container className="mt-5">
            <QuestionDetails questionId={id} theme="light" />
            <Button 
                className="mt-5 mb-4 px-4 py-2 bg-blue-500 text-white rounded-2xl font-semibold
                        hover:bg-blue-700" 
                onClick={() => navigate('/questions')}>
                Back to List
            </Button>
        </Container>
    </div>
  );
};

export default QuestionDetailsPage;