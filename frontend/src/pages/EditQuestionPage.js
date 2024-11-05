import React from "react";
import QuestionForm from "../components/QuestionForm";
import { updateData as editQuestion } from "../services/questionService";
import { useParams, useNavigate } from "react-router-dom";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (updatedQuestionData) => {
    try {
      await editQuestion(id, updatedQuestionData); // Use the editQuestion API function
      navigate("/questions"); // Navigate to home page after successful edit
    } catch (error) {
      console.error("Error editing question", error);
    }
  };

  return (
    <div>
      <QuestionForm questionId={id} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditQuestion;
