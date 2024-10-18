import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { getData, updateData, addData } from '../services/questionService';
import './QuestionForm.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuestionForm = ({ questionId }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    id: '',
    title: '',
    description: '',
    category: [],
    complexity: '',
  });

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        try {
          const existingQuestion = await getData(`/${questionId}`);
          if (existingQuestion) {
            setQuestion({
              id: existingQuestion.id,
              title: existingQuestion.title,
              description: existingQuestion.desc, // Assuming backend uses 'desc'
              category: existingQuestion.c,        // Assuming backend uses 'c'
              complexity: existingQuestion.d,      // Assuming backend uses 'd'
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
        category: value.split(",").map(cat => cat.trim()), // Split by comma and trim spaces
      });
    } else {
      setQuestion({ ...question, [name]: value });
    }
  };

  // New handler for ReactQuill
  const handleDescriptionChange = (value) => {
    setQuestion({ ...question, description: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionData = {
      title: question.title,
      desc: question.description, // Mapping 'description' to 'desc'
      c: question.category,        // Mapping 'category' to 'c'
      d: question.complexity,      // Mapping 'complexity' to 'd'
    };
    
    try {
      if (questionId) {
        // Update existing question
        await updateData(`/${questionId}`, questionData);
      } else {
        // Add new question
        await addData("/", questionData);
      }
      navigate("/questions");
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">{questionId ? 'Edit Question' : 'Add New Question'}</h3>
      <Form onSubmit={handleSubmit}>
        {/* Question Title */}
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

        {/* Question Description with ReactQuill */}
        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label>Question Description</Form.Label>
          <ReactQuill
            value={question.description}
            onChange={handleDescriptionChange}
            modules={{
              toolbar: [
                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                [{size: []}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'},
                 {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image', 'video'],
                ['clean']
              ],
            }}
            formats={[
              'header', 'font', 'size',
              'bold', 'italic', 'underline', 'strike', 'blockquote',
              'list', 'bullet', 'indent',
              'link', 'image', 'video'
            ]}
            placeholder="Describe the question, and include any images or code snippets as needed"
          />
        </Form.Group>

        {/* Question Category */}
        <Form.Group controlId="formCategory" className="mt-3">
          <Form.Label>Question Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={question.category.join(', ')} // Display as comma-separated
            onChange={handleChange}
            required
            placeholder="Enter the categories of the question, separated by commas"
          />
        </Form.Group>

        {/* Question Complexity */}
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

        {/* Submit Button */}
        <Button variant="primary" type="submit" className="mt-3">
          {questionId ? 'Update Question' : 'Add Question'}
        </Button>
      </Form>
    </Container>
  );
};

export default QuestionForm;

