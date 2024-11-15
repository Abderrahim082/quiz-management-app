import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherQuizzes from './components/TeacherQuizzes';
import QuizQuestions from './components/QuizQuestions';
import AllQuestions from './components/AllQuestions';

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<TeacherQuizzes />} />
        <Route path="/quiz-questions/:quizId" element={<QuizQuestions />} />
        <Route path="/all-questions/:quizId" element={<AllQuestions />} />
      </Routes>
    </Router>
  );
}