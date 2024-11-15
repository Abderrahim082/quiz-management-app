import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

export const fetchQuizzes = createAsyncThunk('quiz/fetchQuizzes', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/quizzes`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const addQuiz = createAsyncThunk('quiz/addQuiz', async (quiz, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${BASE_URL}/quizzes`, quiz);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateQuiz = createAsyncThunk('quiz/updateQuiz', async (quiz, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${BASE_URL}/quizzes/${quiz.id}`, quiz);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteQuiz = createAsyncThunk('quiz/deleteQuiz', async (quizId, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE_URL}/quizzes/${quizId}`);
    return quizId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchCourses = createAsyncThunk('quiz/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/courses`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const fetchQuestions = createAsyncThunk('quiz/fetchQuestions', async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    return { quizId, questions: response.data.questions || [] };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const addQuestion = createAsyncThunk('quiz/addQuestion', async ({ quizId, question }, { rejectWithValue }) => {
  try {
    // First, get the current quiz
    const quizResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    const quiz = quizResponse.data;
    
    // Ajouter un ID unique à la question
    const newQuestion = {
      ...question,
      id: Date.now().toString() // Génère un ID unique basé sur le timestamp
    };
    
    // Add the new question to the questions array
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


export const updateQuestion = createAsyncThunk('quiz/updateQuestion', async ({ quizId, question }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${BASE_URL}/quizzes/${quizId}/questions/${question.id}`, question);
    return { quizId, question: response.data };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteQuestion = createAsyncThunk('quiz/deleteQuestion', async ({ quizId, questionId }, { rejectWithValue }) => {
  try {
    // Récupérer d'abord le quiz
    const quizResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
    const quiz = quizResponse.data;

    // Filtrer pour enlever la question avec l'ID spécifique
    quiz.questions = quiz.questions.filter(q => q.id !== questionId);

    // Mettre à jour le quiz complet
    await axios.put(`${BASE_URL}/quizzes/${quizId}`, quiz);
    
    return { quizId, questionId };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});



const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    questions: {},
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
        state.questions[action.payload.quizId] = action.payload.questions;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        if (!state.questions[action.payload.quizId]) {
          state.questions[action.payload.quizId] = [];
        }
        state.questions[action.payload.quizId].push(action.payload.question);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions[action.payload.quizId].findIndex(q => q.id === action.payload.question.id);
        if (index !== -1) {
          state.questions[action.payload.quizId][index] = action.payload.question;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        if (state.questions[action.payload.quizId]) {
          state.questions[action.payload.quizId] = state.questions[action.payload.quizId].filter(q => q.id !== action.payload.questionId);
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      
  },
});

export default quizSlice.reducer;