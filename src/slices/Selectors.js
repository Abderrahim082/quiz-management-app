import { createSelector } from '@reduxjs/toolkit';

const selectQuizState = state => state.quiz;

export const selectQuizzes = createSelector(
  [selectQuizState],
  (quizState) => quizState.quizzes
);

export const selectQuizStatus = createSelector(
  [selectQuizState],
  (quizState) => quizState.status
);

export const selectQuizError = createSelector(
  [selectQuizState],
  (quizState) => quizState.error
);

export const selectQuizQuestions = createSelector(
  [selectQuizState, (state, quizId) => quizId],
  (quizState, quizId) => quizState.questions[quizId] || []
);