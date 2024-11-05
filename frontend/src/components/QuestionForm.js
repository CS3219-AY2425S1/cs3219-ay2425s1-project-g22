import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { getData, updateData, addData } from '../services/questionService';
import './QuestionForm.css';
import TabbedDescriptionBox from './TabbedDescriptionBox';

const QuestionForm = ({ questionId }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    id: '',
    title: '',
    description: '',
    category: [],
    complexity: '',
  });
  const [mode, setMode] = useState('write');

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const existingQuestion = await getData(`/${questionId}`);
          if (existingQuestion) {
            setQuestion({
              title: existingQuestion.title,
              description: existingQuestion.desc,
              category: existingQuestion.c,
              complexity: existingQuestion.d,
            });
          }
        } catch (error) {
          console.error("Error fetching question:", error);
        }
      };
      fetchQuestion();
    }
  }, [questionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setQuestion({
        ...question,
        category: value.split(", "),
      });
    } else {
      setQuestion({ ...question, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      const questionData = {
        title: question.title,
        desc: question.description,
        c: question.category,
        d: question.complexity,
      };
    
    try {
      if (questionId) {
        //update question
        await updateData(`/${questionId}`, questionData);
      } else {
        //create a new question
        await addData("/", questionData);
      }
        navigate("/questions");
    } catch (error) {
        console.error("Error saving question:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">{questionId ? 'Edit Question' : 'Add New Question'}</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Question Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={question.title}
            onChange={handleChange}
            required
            placeholder="Enter the title of the question"
          />
        </Form.Group>
        <Form.Group controlId="formCategory" className="mt-3">
          <Form.Label>Question Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={question.category}
            onChange={handleChange}
            required
            placeholder="Enter the category of the question"
          />
        </Form.Group>
        <Form.Group controlId="formComplexity" className="mt-3">
          <Form.Label>Question Complexity</Form.Label>
          <Form.Control
            as="select"
            name="complexity"
            value={question.complexity}
            onChange={handleChange}
            required
          >
            <option value="">Select Complexity</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label>Question Description</Form.Label>        
          <TabbedDescriptionBox 
            selectedTab={mode} 
            setSelectedTab={setMode}
            text={question.description}
            handleChange={handleChange}
          />
        </Form.Group>  
        <div className='mt-5 mb-3'> 
          <button 
            className="mr-4 px-4 py-2 bg-gray-500 text-white rounded-2xl font-semibold hover:bg-gray-700"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700"
            type="submit"
          >
            {questionId ? 'Update Question' : 'Add Question'}
          </button>  
        </div>
          
      </Form>
    </Container>
  );
};

export default QuestionForm;
