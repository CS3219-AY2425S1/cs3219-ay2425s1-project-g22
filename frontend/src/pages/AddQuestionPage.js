import React from "react";
import QuestionForm from "../components/QuestionForm";
import { addData as addQuestion } from "../services/questionService";
import { useNavigate } from "react-router-dom";

const AddQuestion = () => {
  const navigate = useNavigate();
  const handleSubmit = async (questionData) => {
    try {
      await addQuestion(questionData); // Use the addQuestion API function
      console.log("Question added successfully"); // Debug log for success
      navigate("/questions"); // Navigate to home page after successful addition
    } catch (error) {
      console.error("Error adding question", error);
    }
  };

  return (
    <div>
      <QuestionForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddQuestion;
