import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../slices/quizSlice';
import { selectQuizQuestions } from '../slices/Selectors';

export default function QuizQuestions() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const questions = useSelector(state => selectQuizQuestions(state, quizId));

  useEffect(() => {
    if (quizId) {
      dispatch(fetchQuestions(quizId));
    }
  }, [quizId, dispatch]);

  if (!quizId) {
    return <div>Error: No quiz ID provided</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Questions</h1>
      {questions.length === 0 ? (
        <p>No questions available for this quiz.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((question, index) => (
            <li key={question.id || `question-${index}`} className="border p-4 rounded shadow">
              <h3 className="font-bold">{index + 1}. {question.question}</h3>
              <ul className="list-disc list-inside mt-2">
                {question.answers.map((answer, answerIndex) => (
                  <li key={`answer-${question.id || index}-${answerIndex}`} className={answer === question.correctAnswer ? 'text-green-500' : ''}>
                    {answer}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}