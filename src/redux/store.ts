import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import mentorReducer from './slices/mentorSlice';
import quizReducer from './slices/quizSlice';
import enrollReducer from './slices/enrollSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    mentor: mentorReducer,
    quiz: quizReducer,
    enroll: enrollReducer
  },
});

// Export RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
