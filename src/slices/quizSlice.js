import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

// Async thunk to fetch quizzes
export const fetchQuizzes = createAsyncThunk('quiz/fetchQuizzes', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/quizzes`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to add a quiz
export const addQuiz = createAsyncThunk('quiz/addQuiz', async (quiz, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${BASE_URL}/quizzes`, quiz);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to update a quiz
export const updateQuiz = createAsyncThunk('quiz/updateQuiz', async (quiz, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${BASE_URL}/quizzes/${quiz.id}`, quiz);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to delete a quiz
export const deleteQuiz = createAsyncThunk('quiz/deleteQuiz', async (quizId, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE_URL}/quizzes/${quizId}`);
    return quizId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to fetch courses
export const fetchCourses = createAsyncThunk('quiz/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/courses`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to fetch questions for a specific quiz
export const fetchQuestions = createAsyncThunk('quiz/fetchQuestions', async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    const existingQuestions = response.data.questions || [];

    // Filter out duplicate questions based on their text
    const uniqueQuestions = existingQuestions.reduce((acc, question) => {
      if (!acc.some(q => q.question === question.question)) {
        acc.push(question);
      }
      return acc;
    }, []);

    return { quizId, questions: uniqueQuestions };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to add a question to a quiz
export const addQuestion = createAsyncThunk('quiz/addQuestion', async ({ quizId, question }, { rejectWithValue }) => {
  try {
    const quizResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    const quiz = quizResponse.data;

    // Add a unique ID to the question
    const newQuestion = {
      ...question,
      id: Date.now().toString() // Generate a unique ID based on the timestamp
    };

    // Ensure the questions array exists
    if (!quiz.questions) {
      quiz.questions = [];
    }
    quiz.questions.push(newQuestion);

    // Update the entire quiz object
    const response = await axios.put(`${BASE_URL}/quizzes/${quizId}`, quiz);
    return { quizId, question: newQuestion };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to delete a question from a quiz
export const deleteQuestion = createAsyncThunk('quiz/deleteQuestion', async ({ quizId, questionId }, { rejectWithValue }) => {
  try {
    const quizResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    const quiz = quizResponse.data;

    // Filter out the question with the specific ID
    quiz.questions = quiz.questions.filter(q => q.id !== questionId);

    // Update the complete quiz
    await axios.put(`${BASE_URL}/quizzes/${quizId}`, quiz);
    
    return { quizId, questionId };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Async thunk to delete multiple questions from a quiz
export const deleteAllQuestions = createAsyncThunk('quiz/deleteAllQuestions', async ({ quizId, questionIds }, { rejectWithValue }) => {
  try {
    const quizResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    const quiz = quizResponse.data;

    // Filter out the questions with the specific IDs
    quiz.questions = quiz.questions.filter(q => !questionIds.includes(q.id));

    // Update the complete quiz
    await axios.put(`${BASE_URL}/quizzes/${quizId}`, quiz);
    
    return { quizId, deletedIds: questionIds };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Create the quiz slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    questions: {}, // This will hold questions by quizId
    courses: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(quiz => quiz.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(quiz => quiz.id !== action.payload);
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.questions[action.payload.quizId] = action.payload.questions; // Store questions by quizId
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        if (!state.questions[action.payload.quizId]) {
          state.questions[action.payload.quizId] = [];
        }
        state.questions[action.payload.quizId].push(action.payload.question);
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        const { quizId, questionId } = action.payload; // Destructure the payload
        if (Array.isArray(state.questions[quizId])) {
          state.questions[quizId] = state.questions[quizId].filter(q => q.id !== questionId);
        } else {
          console.error(`state.questions[${quizId}] is not an array`, state.questions[quizId]);
        }
      })
      .addCase(deleteAllQuestions.fulfilled, (state, action) => {
        const { quizId, deletedIds } = action.payload; // Destructure the payload
        if (Array.isArray(state.questions[quizId])) {
          state.questions[quizId] = state.questions[quizId].filter(q => !deletedIds.includes(q.id));
        } else {
          console.error(`state.questions[${quizId}] is not an array`, state.questions[quizId]);
        }
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      });
  },
});

export default quizSlice.reducer;