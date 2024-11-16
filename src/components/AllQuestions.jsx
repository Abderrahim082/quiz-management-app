
import{ useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, deleteQuestion, addQuestion ,deleteAllQuestions} from '../slices/quizSlice';
import axios from 'axios';
import { X } from 'lucide-react';

const BASE_URL = 'http://localhost:3001';

export default function AllQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const questions = useSelector(state => state.quiz.questions[quizId] || []);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
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

  const handleDelete = async () => {
    const selectedCount = selectedQuestions.length;
  
    // Check if there are any selected questions
    if (selectedCount === 0) return;
  
    // Create a confirmation message
    const confirmationMessage = selectedCount === 1
      ? 'Are you sure you want to delete this question?'
      : selectedCount === questions.length
        ? 'Are you sure you want to delete all questions?'
        : `Are you sure you want to delete these ${selectedCount} questions?`;
  
    // Show confirmation dialog
    if (!window.confirm(confirmationMessage)) {
      return; // Exit if the user cancels
    }
  
    try {
      if (selectedCount === 1) {
        // Delete a single question
        await dispatch(deleteQuestion({ quizId, questionId: selectedQuestions[0] }));
      } else if (selectedCount === questions.length) {
        // Delete all questions
        await dispatch(deleteAllQuestions({ quizId, questionIds: selectedQuestions }));
      } else {
        // Delete multiple selected questions
        await Promise.all(selectedQuestions.map(questionId => 
          dispatch(deleteQuestion({ quizId, questionId }))
        ));
      }
  
      // Clear the selected questions after deletion
      setSelectedQuestions([]);
  
      // Provide feedback to the user
      alert(`Successfully deleted ${selectedCount === 1 ? 'the question' : selectedCount === questions.length ? 'all questions' : `${selectedCount} questions`}.`);
      
      // Optionally call setSelectAll if needed
      setSelectAll();
    } catch (error) {
      console.error('Error deleting questions:', error);
      alert('An error occurred while deleting the questions. Please try again.');
    }
  };
  // const handleBulkDelete = async () => {
  //   // Check if there are any selected questions
  //   if (selectedQuestions.length === 0) return;
  
  //   // Create a confirmation message
  //   const confirmationMessage = `Are you sure you want to delete ${selectedQuestions.length === 1 ? 'this question' : 'these questions'}?`;
  
  //   // Show confirmation dialog
  //   if (!window.confirm(confirmationMessage)) {
  //     return; // Exit if the user cancels
  //   }
  
  //   try {
  //     // Filter out the questions to delete based on selected IDs
  //     const questionsToDelete = questions.filter(q => selectedQuestions.includes(q.id));
  
  //     // Perform deletion for all selected questions
  //     await Promise.all(questionsToDelete.map(question => 
  //       dispatch(deleteQuestion({ quizId, questionId: question.id }))
  //     ));
  
  //     // Clear the selected questions after deletion
  //     setSelectedQuestions([]);
  
  //     // Provide feedback to the user  
  //     // Optionally call setSelectAll if needed
  //     setSelectAll();
  //   } catch (error) {
  //     console.error('Error deleting questions:', error);
  //     alert('An error occurred while deleting the questions. Please try again.');
  //   }
  // };

  
  const handleAddQuestion = async () => {
    await dispatch(addQuestion({ quizId, question: newQuestion }));
    setIsAddModalOpen(false);
    setNewQuestion({
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: ''
    });
  };
  const handleUploadQuestions = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
  
    fileInput.onchange = async () => {
      if (!fileInput.files || fileInput.files.length === 0) {
        console.error('No file selected for upload.');
        return;
      }
  
      const file = fileInput.files[0];
      const reader = new FileReader();
  
      reader.onload = async () => {
        try {
          const csvData = reader.result;
          const newQuestions = CSVToJson(csvData); // Convert CSV to JSON (returns an array of questions)
  
          // Fetch the target quiz by its ID
          const { data: existingQuiz } = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
          console.log(existingQuiz); // Log the existing quiz object
  
          if (!existingQuiz) {
            console.error(`Quiz with ID ${quizId} not found.`);
            return;
          }
  
          // Ensure existingQuiz.questions is an array
          const existingQuestions = Array.isArray(existingQuiz.questions) ? existingQuiz.questions : [];
  
          // Merge new questions into the existing questions array
          const updatedQuestions = [...existingQuestions, ...newQuestions];
  
          // Update the quiz with the new questions
          await axios.put(`${BASE_URL}/quizzes/${quizId}`, {
            ...existingQuiz,
            questions: updatedQuestions,
          });
  
          console.log('Questions uploaded and added successfully.');
          dispatch(fetchQuestions(quizId)); // Refresh questions in the app state
        } catch (error) {
          console.error('Error uploading questions:', error);
        }
      };
  
      reader.readAsText(file);
    };
  
    fileInput.click();
  };
  // Helper function to convert CSV to JSON (returns an array of questions)
  const CSVToJson = (csv) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
  
    const questions = [];
  
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
  
      if (currentLine.length < headers.length) continue; // Skip incomplete lines
  
      questions.push({
        id: currentLine[headers.indexOf('id')], // Include the ID
        question: currentLine[headers.indexOf('question')],
        answers: currentLine[headers.indexOf('answers')].split(';'), // assuming answers are separated by ';'
        correctAnswer: currentLine[headers.indexOf('correctAnswer')],
      });
    }
  
    return questions;
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
                <td className="p-2">{question.question}</td>
                <td className="p-2">
                  <ul>
                    {question.answers.map((answer, idx) => (
                      <li key={`answer-${question.id}-${idx}`}>{answer}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-2">{question.correctAnswer}</td>
                
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
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            >
              Delete Selected
            </button>
          )}
          <button
            onClick={handleUploadQuestions}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Upload Questions
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
};










