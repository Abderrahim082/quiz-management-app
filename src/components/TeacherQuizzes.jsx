import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes, deleteQuiz, addQuiz, updateQuiz, fetchCourses } from '../slices/quizSlice';
import { Trash2, Edit, Eye, Plus, X } from 'lucide-react';

export default function TeacherQuizzes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const quizzes = useSelector((state) => state.quiz.quizzes);
  const status = useSelector((state) => state.quiz.status);
  const error = useSelector((state) => state.quiz.error);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    courseName:'',
    courseId: '',
    teacherName: '',
    Deadline: '',
    status: '',
  });
  const [editingQuiz, setEditingQuiz] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuizzes());
      dispatch(fetchCourses());
    }
  }, [status, dispatch]);

  // Dans TeacherQuizzes.jsx, ajoutez cet état
  const [selectedCourse, setSelectedCourse] = useState('');
  const courses = useSelector((state) => state.quiz.courses) || [];

  // Ajoutez cette fonction pour filtrer les quizzes
  const filteredQuizzes = selectedCourse
    ? quizzes.filter(quiz => quiz.courseId === selectedCourse)
    : quizzes;
  const handleDelete = (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      dispatch(deleteQuiz(quizId));
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setIsEditModalOpen(true);
  };

  const handleUpdateQuiz = () => {
    dispatch(updateQuiz(editingQuiz));
    setIsEditModalOpen(false);
    setEditingQuiz(null);
  };

  const handleViewDetails = (quizId) => {
    navigate(`/quiz-questions/${quizId}`);
  };

  const handleAddQuestions = (quizId) => {
    navigate(`/all-questions/${quizId}`);
  };

  const handleAddQuiz = () => {
    dispatch(addQuiz(newQuiz));
    setIsAddModalOpen(false);
    setNewQuiz({
      courseName: '',
      teacherName: '',
      Deadline: '',
      status: '',
    });
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Quizzes</h1>
      <div className="mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-64 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.courseId} value={course.courseId}>
              {course.courseName}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
      >
        <Plus size={20} className="mr-2" /> Add Quiz
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 ease-in-out transform hover:scale-105">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-gray-800">{quiz.courseName}</h3>
              <p className="text-gray-600 mb-1">Teacher: {quiz.teacherName}</p>
              <p className="text-gray-600 mb-1">Deadline: {new Date(quiz.Deadline).toLocaleDateString()}</p>
              <p className="text-gray-600 mb-4">Status: <span className={`font-semibold ${quiz.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>{quiz.status}</span></p>
              <div className="flex justify-between items-center">
                <button onClick={() => handleDelete(quiz.id)} className="text-red-500 hover:text-red-600 transition duration-300 ease-in-out">
                  <Trash2 size={20} />
                </button>
                <button onClick={() => handleEdit(quiz)} className="text-blue-500 hover:text-blue-600 transition duration-300 ease-in-out">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleViewDetails(quiz.id)} className="text-green-500 hover:text-green-600 transition duration-300 ease-in-out">
                  <Eye size={20} />
                </button>
                <button onClick={() => handleAddQuestions(quiz.id)} className="text-purple-500 hover:text-purple-600 transition duration-300 ease-in-out font-semibold">
                  Add Questions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New Quiz</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <select
              value={newQuiz.courseId}
              onChange={(e) => setNewQuiz({
                ...newQuiz,
                courseId: e.target.value,
                courseName: courses.find(course => course.courseId === e.target.value)?.courseName
              })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Teacher Name"
              value={newQuiz.teacherName}
              onChange={(e) => setNewQuiz({ ...newQuiz, teacherName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="datetime-local"
              value={newQuiz.Deadline}
              onChange={(e) => setNewQuiz({ ...newQuiz, Deadline: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={newQuiz.status}
              onChange={(e) => setNewQuiz({ ...newQuiz, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>

            <div className="flex justify-end">
              <button onClick={handleAddQuiz} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mr-2">Add</button>
              <button onClick={() => setIsAddModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Quiz</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <select
              value={editingQuiz.courseId}
              onChange={(e) => setEditingQuiz({
                ...editingQuiz,
                courseId: e.target.value,
                courseName: courses.find(course => course.courseId === e.target.value)?.courseName
              })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Teacher Name"
              value={editingQuiz.teacherName}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            />
            <input
              type="datetime-local"
              value={editingQuiz.Deadline}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, Deadline: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={editingQuiz.status}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <div className="flex justify-end">
              <button onClick={handleUpdateQuiz} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mr-2 transition duration-300 ease-in-out">Update</button>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}