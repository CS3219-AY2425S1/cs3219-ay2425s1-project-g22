// src/components/QuestionList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { getData, deleteData } from "../services/questionService";
import './QuestionList.css'; // Custom CSS for QuestionList
import QuestionFilter from './QuestionFilter';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getData("/");
        setQuestions(response);
        setFilteredQuestions(response); // Initialize filteredQuestions with all questions
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
      setFilteredQuestions(updatedQuestions); // Update filteredQuestions as well
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleQuestionClick = (id) => {
    navigate(`/questions/${id}`);
  };

  const handleFilter = (filterCriteria) => {
    let filtered = [...questions];

    if (filterCriteria.title) {
      filtered = filtered.filter((q) =>
        q.title.toLowerCase().includes(filterCriteria.title.toLowerCase())
      );
    }
    if (filterCriteria.categories.length > 0) {
      filtered = filtered.filter((q) =>
        filterCriteria.categories.every((c) => q.categories.includes(c))
      );
    }
    if (filterCriteria.complexity) {
      filtered = filtered.filter(
        (q) => q.complexity === filterCriteria.complexity
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleClearFilters = () => {
    setFilteredQuestions(questions);
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Question Repository</h2>
      <Link to="/questions/add" className="btn btn-primary mb-3">Add New Question</Link>

      {/* QuestionFilter Component */}
      <QuestionFilter onFilter={handleFilter} />

      {/* Optional: Clear Filters Button */}
      <Button variant="secondary" onClick={handleClearFilters} className="mb-3">
        Clear Filters
      </Button>

      <Row>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <Col md={4} key={question.id} className="mb-4">
              <Card 
                className="question-card shadow-sm" 
                onClick={() => handleQuestionClick(question.id)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <Card.Title>{question.title}</Card.Title>
                  <Card.Text><strong>Category:</strong> {question.categories.join(', ')}</Card.Text>
                  <Card.Text><strong>Complexity:</strong> {question.complexity}</Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      as={Link} 
                      to={`/questions/edit/${question.id}`} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      onClick={(e) => {e.stopPropagation(); deleteQuestion(question.id)}}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">No questions found matching the criteria.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default QuestionList;

