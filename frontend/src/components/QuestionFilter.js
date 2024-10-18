// src/components/QuestionFilter.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Select from 'react-select';

const QuestionFilter = ({ onFilter }) => {
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [complexity, setComplexity] = useState('');

  const categoryOptions = [
    { value: 'math', label: 'Math' },
    { value: 'science', label: 'Science' },
    // Add more topics
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({
      title,
      categories: categories.map((c) => c.value),
      complexity,
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Form.Group controlId="filterTitle">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Search by title"
        />
      </Form.Group>
      <Form.Group controlId="filterCategories" className="mt-3">
        <Form.Label>Topics</Form.Label>
        <Select
          isMulti
          options={categoryOptions}
          value={categories}
          onChange={setCategories}
        />
      </Form.Group>
      <Form.Group controlId="filterComplexity" className="mt-3">
        <Form.Label>Complexity</Form.Label>
        <Form.Control
          as="select"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Form.Control>
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">
        Filter
      </Button>
    </Form>
  );
};

export default QuestionFilter;

