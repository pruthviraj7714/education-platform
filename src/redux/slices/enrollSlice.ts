import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const enrollApiUrl = import.meta.env.VITE_MENTOR_API_URL;

interface Course {
  _id: string;
  title: string;
  description: string;
  creator: string;
  price: number;
  tags: string[];
  shortBio: string;
}

interface EnrollState {
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollState = {
  enrolledCourses: [],
  loading: false,
  error: null,
};

// Enroll in a course
export const enrollCourse = createAsyncThunk<
  { enrolledCourse: Course; updatedCourses: Course[] },
  { courseId: string; authToken: string },
  { rejectValue: string }
>(
  "enroll/enrollCourse",
  async ({ courseId, authToken }, { rejectWithValue }) => {
    try {
      const enrollResponse = await axios.put(
        `${enrollApiUrl}/enroll/${courseId}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const coursesResponse = await axios.get(`${enrollApiUrl}/enroll`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return {
        enrolledCourse: enrollResponse.data,
        updatedCourses: coursesResponse.data || []
      };
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to enroll in the course"
      );
    }
  }
);

// Unenroll from a course
export const unenrollCourse = createAsyncThunk<
  { courseId: string; updatedCourses: Course[] },
  { courseId: string; authToken: string },
  { rejectValue: string }
>(
  "enroll/unenrollCourse",
  async ({ courseId, authToken }, { rejectWithValue }) => {
    try {
      await axios.delete(`${enrollApiUrl}/enroll/${courseId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const coursesResponse = await axios.get(`${enrollApiUrl}/enroll`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return {
        courseId,
        updatedCourses: coursesResponse.data || []
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unenroll from the course"
      );
    }
  }
);

export const fetchEnrolledCourses = createAsyncThunk<
  Course[],
  string,
  { rejectValue: string }
>("enroll/fetchEnrolledCourses", async (authToken, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${enrollApiUrl}/enroll`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch enrolled courses"
    );
  }
});

const enrollSlice = createSlice({
  name: "enroll",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(enrollCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        enrollCourse.fulfilled,
        (state, action: PayloadAction<{ enrolledCourse: Course; updatedCourses: Course[] }>) => {
          state.loading = false;
          state.enrolledCourses = action.payload.updatedCourses;
        }
      )
      .addCase(
        enrollCourse.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to enroll in the course";
        }
      );

    builder
      .addCase(unenrollCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        unenrollCourse.fulfilled,
        (state, action: PayloadAction<{ courseId: string; updatedCourses: Course[] }>) => {
          state.loading = false;
          state.enrolledCourses = action.payload.updatedCourses;
        }
      )
      .addCase(
        unenrollCourse.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to unenroll from the course";
        }
      );

    builder
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEnrolledCourses.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          state.loading = false;
          state.enrolledCourses = action.payload;
        }
      )
      .addCase(
        fetchEnrolledCourses.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch enrolled courses";
        }
      );
  },
});

export default enrollSlice.reducer;