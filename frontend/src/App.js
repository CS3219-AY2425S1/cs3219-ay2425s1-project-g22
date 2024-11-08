import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QuestionList from './components/QuestionList';
import AddQuestion from './pages/AddQuestionPage';
import EditQuestion from './pages/EditQuestionPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RequestResetPasswordPage from './pages/RequestResetPasswordPage';
import SignUpPage from './pages/SignUpPage';
import SelectComplexityPage from './pages/SelectComplexityPage';
import SelectLanguagePage from './pages/SelectLanguagePage';
import SelectTopicPage from './pages/SelectTopicPage';
import MatchingPage from './pages/MatchingPage';
import MatchedPage from './pages/MatchedPage';
import MatchingFailedPage from './pages/MatchingFailedPage';
import CollaborationPage from './pages/CollaborationPage';
import HistoryPage from './pages/HistoryPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header';
import QuestionDetailsPage from './pages/QuestionDetailsPage';

function App() {
  const [topics, setTopics] = useState([]);
  const [difficulties, setDifficulties] = useState({
    easy: false,
    medium: false,
    hard: false,
  });
  const [languages, setLanguages] = useState('');
  const [matchResult, setMatchResult] = useState({
    userId: "user123",
    matchedUserId: "user456",
    topic: "String Manipulation",
    difficulty: "Medium",
    language: "JavaScript", // or "Python", "Java", etc (not case sensitive)
  });

  return (
    <Router>
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to='/topic' />} />
          <Route path="/topic" element={<PrivateRoute><SelectTopicPage topics={topics} setTopics={setTopics} /></PrivateRoute>} />
          <Route path="/complexity" element={<PrivateRoute><SelectComplexityPage difficulties={difficulties} setDifficulties={setDifficulties} /></PrivateRoute>} />
          <Route path="/language" element={<PrivateRoute><SelectLanguagePage languages={languages} setLanguages={setLanguages} /></PrivateRoute>} />
          <Route path="/matching" element={<PrivateRoute><MatchingPage difficulties={difficulties} topics={topics} languages={languages} setMatchResult={setMatchResult} /></PrivateRoute>} />
          <Route path="/matched" element={<PrivateRoute><MatchedPage matchResult={matchResult} /></PrivateRoute>} />
          <Route path="/failed" element={<PrivateRoute><MatchingFailedPage /></PrivateRoute>} />
          <Route path="/room" element={<PrivateRoute><CollaborationPage/></PrivateRoute>} />
          <Route path="/room/:roomId" element={<PrivateRoute><CollaborationPage/></PrivateRoute>} />
          <Route path="/user/:userId/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset" element={<RequestResetPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/questions" element={<AdminRoute><QuestionList /></AdminRoute>} />
          <Route path="/questions/add" element={<AdminRoute><AddQuestion /></AdminRoute>} />
          <Route path="/questions/edit/:id" element={<AdminRoute><EditQuestion /></AdminRoute>} />
          <Route path="/questions/:id" element={<AdminRoute><QuestionDetailsPage /></AdminRoute>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
