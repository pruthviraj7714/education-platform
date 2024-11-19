import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const mentorApiUrl = import.meta.env.VITE_MENTOR_API_URL;

interface Solution {
  solution: string | string[];
  options?: string[];
}

interface Question {
  _id: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
  content: string;
  solution: Solution;
  courseId: string;
  creatorId: string;
  quizId: string;
  explanation : string;
  createdAt: string;
  updatedAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  creatorId: string;
  courseId: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

interface QuizState {
  loading: boolean;
  error: string | null;
  quiz: Quiz[];
  questions: Question[];
}

export const createQuizWithQuestions = createAsyncThunk(
  "quiz/createQuizWithQuestions",
  async (
    {
      courseId,
      quizData,
    }: {
      courseId: string;
      quizData: {
        title: string;
        description: string;
        questions: {
          questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
          content: string;
          solution: Solution;
          explanation : string;
        }[];
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const requestBody = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions.map((question) => ({
          questionType: question.questionType,
          content: question.content,
          explanation : question.explanation,
          solution: {
            solution: question.solution.solution,
            options: question.solution.options || [],
          },
        })),
      };

      const response = await axios.post(
        `${mentorApiUrl}/quiz/${courseId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create quiz");
    }
  }
);

// Thunk to fetch a quiz by courseId
export const getQuiz = createAsyncThunk(
  "quiz/getQuiz",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.get(`${mentorApiUrl}/quiz/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch quiz");
    }
  }
);

// Thunk to fetch a quiz by quizId and courseId
export const getQuizById = createAsyncThunk(
  "quiz/getQuizById",
  async (
    { courseId, quizId }: { courseId: string; quizId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.get(
        `${mentorApiUrl}/quiz/${courseId}/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch quiz by ID"
      );
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quiz/deleteQuiz",
  async (
    { courseId, quizId }: { courseId: string; quizId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");

      await axios.delete(`${mentorApiUrl}/quiz/${courseId}/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return quizId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete quiz");
    }
  }
);

export const submitQuiz = createAsyncThunk(
  "quiz/submitQuiz",
  async (
    {
      courseId,
      quizId,
      answers,
    }: {
      courseId: string;
      quizId: string;
      answers: {
        questionId: string;
        answer: string | string[];
      }[];
    },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const requestBody = {
        answers, // Use the provided answers directly
      };

      const response = await axios.post(
        `${mentorApiUrl}/quiz/submit/${courseId}/${quizId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to submit quiz");
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quiz/updateQuiz",
  async (
    {
      courseId,
      quizId,
      updatedData,
    }: {
      courseId: string;
      quizId: string;
      updatedData: {
        title?: string;
        description?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");
      console.log(updatedData);
      const response = await axios.put(
        `${mentorApiUrl}/quiz/${courseId}/${quizId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update quiz");
    }
  }
);

export const overwriteQuizQuestions = createAsyncThunk(
  "quiz/overwriteQuizQuestions",
  async (
    {
      courseId,
      quizId,
      updatedData,
    }: {
      courseId: string;
      quizId: string;
      updatedData: {
        title: string;
        description: string;
        questions: {
          questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
          content: string;
          solution: Solution;
          explanation : string;
        }[];
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const requestBody = {
        title: updatedData.title,
        description: updatedData.description,
        questions: updatedData.questions.map((question) => ({
          questionType: question.questionType,
          content: question.content,
          explanation : question.explanation,
          solution: {
            solution: question.solution.solution,
            options: question.solution.options || [],
          },
        })),
      };

      const response = await axios.put(
        `${mentorApiUrl}/quiz/overwrite-questions/${courseId}/${quizId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to overwrite quiz questions"
      );
    }
  }
);

const initialState: QuizState = {
  loading: false,
  error: null,
  quiz: [],
  questions: [],
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createQuizWithQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createQuizWithQuestions.fulfilled,
        (state, action: PayloadAction<Quiz>) => {
          state.loading = false;
          state.quiz = [action.payload];
          state.questions = action.payload.questions || [];
        }
      )
      .addCase(createQuizWithQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getQuiz.fulfilled,
        (state, action: PayloadAction<Quiz | Quiz[]>) => {
          state.loading = false;
          state.quiz = Array.isArray(action.payload)
            ? action.payload
            : [action.payload];
          state.questions = state.quiz.flatMap((quiz) => quiz.questions || []);
        }
      )
      .addCase(getQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizById.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.loading = false;
        state.quiz = [action.payload];
        state.questions = action.payload.questions || [];
      })
      .addCase(getQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.quiz = state.quiz.filter((quiz) => quiz._id !== action.payload);
        state.questions = state.questions.filter(
          (question) => question.quizId !== action.payload
        );
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.loading = false;

        state.quiz = state.quiz.map((quiz) =>
          quiz._id === action.payload._id ? action.payload : quiz
        );
        state.questions = action.payload.questions || [];
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(overwriteQuizQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        overwriteQuizQuestions.fulfilled,
        (state, action: PayloadAction<Quiz>) => {
          state.loading = false;
          state.quiz = state.quiz.map((quiz) =>
            quiz._id === action.payload._id ? action.payload : quiz
          );
          state.questions = action.payload.questions || [];
        }
      )
      .addCase(overwriteQuizQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default quizSlice.reducer;
