// src/components/AllQuestions.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, updateQuestion, deleteQuestion, addQuestion } from '../slices/quizSlice';
import axios from 'axios';
import { X } from 'lucide-react';

const BASE_URL = 'http://localhost:3001';

export default function AllQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const questions = useSelector(state => state.quiz.questions[quizId] || []);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [editForm, setEditForm] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: ''
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: ''
  });

  useEffect(() => {
    if (quizId) {
      dispatch(fetchQuestions(quizId));
    }
  }, [quizId, dispatch]);


  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // Select all questions
      setSelectedQuestions(questions.map(q => q.id));
    } else {
      // Deselect all
      setSelectedQuestions([]);
    }
  };



  const handleSelect = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleBulkDelete = () => {
    // Delete all selected questions
    selectedQuestions.forEach(id => {
      handleDelete()
    });
    setSelectedQuestions([]);
    setSelectAll();
  };
  const handleEdit = (question) => {
    setEditingId(question.id);
    setEditForm(question);
  };

  const handleSaveUpdate = async () => {
    await dispatch(updateQuestion({ quizId, question: editForm }));
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (selectedQuestions.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length === 1 ? 'this question' : 'these questions'}?`)) {
      try {
        const questionToDelete = questions.find(q => q.id === selectedQuestions[0]);
        if (questionToDelete) {
          await dispatch(deleteQuestion({ quizId, questionId: questionToDelete.id }));
          setSelectedQuestions([]);
        }
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };


  const handleAddQuestion = async () => {
    await dispatch(addQuestion({ quizId, question: newQuestion }));
    setIsAddModalOpen(false);
    setNewQuestion({
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: ''
    });
  };

  const handleSaveSelectedQuestions = async () => {
    try {
      const quiz = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
      const selectedQuestionsData = questions.filter(q => selectedQuestions.includes(q.id));

      await axios.put(`${BASE_URL}/quizzes/${quizId}`, {
        ...quiz.data,
        questionsSelected: selectedQuestionsData
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving selected questions:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-2">Question</th>
              <th className="p-2">Options</th>
              <th className="p-2">Correct Answer</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-b">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => handleSelect(question.id)}
                  />
                </td>
                <td className="p-2">
                  {editingId === question.id ? (
                    <input
                      value={editForm.question}
                      onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    question.question
                  )}
                </td>
                <td className="p-2">
                  {editingId === question.id ? (
                    editForm.answers.map((answer, idx) => (
                      <input
                        key={`edit-answer-${idx}`}
                        value={answer}
                        onChange={e => {
                          const newAnswers = [...editForm.answers];
                          newAnswers[idx] = e.target.value;
                          setEditForm({ ...editForm, answers: newAnswers });
                        }}
                        className="w-full p-1 border rounded mb-1"
                      />
                    ))
                  ) : (
                    <ul> {question.answers.map((answer, idx) => (
                      <li key={`answer-${question.id}-${idx}`}>{answer}</li>
                    ))}</ul>
                  )}
                </td>
                <td className="p-2">
                  {editingId === question.id ? (
                    <select
                      value={editForm.correctAnswer}
                      onChange={e => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                      className="w-full p-1 border rounded"
                    >
                      {editForm.answers.map((answer, idx) => (
                        <option key={`correct-answer-${idx}`} value={answer}>{answer}</option>
                      ))}
                    </select>
                  ) : (
                    question.correctAnswer
                  )}
                </td>
                <td className="p-2">
                  {editingId === question.id ? (
                    <button
                      onClick={handleSaveUpdate}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Save Updates
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(question)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          →Back
        </button>
        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Add Question
          </button>
          {selectedQuestions.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            >
              Delete Selected
            </button>
          )}
          <button
            onClick={handleSaveSelectedQuestions}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Question</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Question"
              value={newQuestion.question}
              onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            {newQuestion.answers.map((answer, idx) => (
              <input
                key={`new-answer-${idx}`}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={answer}
                onChange={e => {
                  const newAnswers = [...newQuestion.answers];
                  newAnswers[idx] = e.target.value;
                  setNewQuestion({ ...newQuestion, answers: newAnswers });
                }}
                className="w-full p-2 border rounded mb-2"
              />
            ))}
            <select
              value={newQuestion.correctAnswer}
              onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Correct Answer</option>
              {newQuestion.answers.map((answer, idx) => (
                <option key={`new-correct-answer-${idx}`} value={answer}>{answer}</option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleAddQuestion}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
