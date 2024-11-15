import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const mentorApiUrl = import.meta.env.VITE_MENTOR_API_URL;

interface Course {
  title: string;
  description: string;
  creator: string;
  price: number;
  tags: string[];
  shortBio: string;
}

interface Chapter {
  _id?: string;
  title: string;
  content: string;
}

interface Tag {
  id: string;
  name: string;
}

interface MentorState {
  chapterData: any;
  courses: Course[];
  loading: boolean;
  error: string | null;
  creatorCourses: Course[];
  chapters: Chapter[];
  tags: Tag[];
}

const initialState: MentorState = {
  courses: [],
  loading: false,
  error: null,
  creatorCourses: [],
  chapters: [],
  chapterData: {
    chapter: null,
    loading: false,
    error: null,
  },
  tags: [],
};

export const createCourse = createAsyncThunk<
  Course,
  { courseData: Course; headers: { Authorization: string } },
  { rejectValue: string }
>(
  'mentor/createCourse',
  async ({ courseData, headers }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${mentorApiUrl}/course`, courseData, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);
export const createChapter = createAsyncThunk<
  Chapter,
  {
    chapterData: Chapter;
    courseId: string;
    headers: { Authorization: string };
  },
  { rejectValue: string }
>(
  'mentor/createChapter',
  async ({ chapterData, courseId, headers }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${mentorApiUrl}/chapter/${courseId}`,
        chapterData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create chapter'
      );
    }
  }
);

export const getCourseChapter = createAsyncThunk<
  Chapter[],
  { courseId: string; authToken: string },
  { rejectValue: string }
>(
  'mentor/getCourseChapter',
  async ({ courseId, authToken }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${mentorApiUrl}/chapter/${courseId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return response.data.chapters || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch course chapters'
      );
    }
  }
);

export const updateChapter = createAsyncThunk<
  Chapter,
  {
    chapterId: string;
    chapterData: Chapter;
    courseId: string;
    headers: { Authorization: string };
  },
  { rejectValue: string }
>(
  'mentor/updateChapter',
  async (
    { chapterId, chapterData, courseId, headers },
    { rejectWithValue }
  ) => {
    try {
      const { _id, ...chapterDataWithoutId } = chapterData;

      const response = await axios.put(
        `${mentorApiUrl}/chapter/${courseId}/${chapterId}`,
        chapterDataWithoutId,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update chapter'
      );
    }
  }
);

export const getChapter = createAsyncThunk<
  Chapter,
  { courseId: string; chapterId: string; authToken: string },
  { rejectValue: string }
>(
  'mentor/getChapter',
  async ({ courseId, chapterId, authToken }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${mentorApiUrl}/chapter/${courseId}/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching chapter:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chapter details'
      );
    }
  }
);

export const updateCourse = createAsyncThunk<
  Course,
  { courseId: string; courseData: Course; headers: { Authorization: string } },
  { rejectValue: string }
>(
  'mentor/updateCourse',
  async ({ courseId, courseData, headers }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${mentorApiUrl}/course/`,
        { ...courseData, courseId },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update the course'
      );
    }
  }
);

export const deleteChapter = createAsyncThunk<
  { chapterId: string },
  {
    chapterId: string;
    courseId: string;
    headers: { Authorization: string };
  },
  { rejectValue: string }
>(
  'mentor/deleteChapter',
  async ({ chapterId, courseId, headers }, { rejectWithValue }) => {
    try {
      await axios.delete(`${mentorApiUrl}/chapter/${courseId}/${chapterId}`, {
        headers,
      });
      return { chapterId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete chapter'
      );
    }
  }
);

export const deleteCourse = createAsyncThunk<
  string,
  { courseId: string; headers: { Authorization: string } },
  { rejectValue: string }
>('mentor/deleteCourse', async ({ courseId, headers }, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${mentorApiUrl}/course/${courseId}`, {
      headers,
    });
    return response.data.message;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete the course'
    );
  }
});

export const fetchCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>('mentor/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${mentorApiUrl}/course/search`);
    return response?.data?.courses || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch courses'
    );
  }
});

export const fetchCoursesByCreator = createAsyncThunk<
  Course[],
  { creatorId: string; authToken: string },
  { rejectValue: string }
>(
  'mentor/fetchCoursesByCreator',
  async ({ creatorId, authToken }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${mentorApiUrl}/course/fetchCourses/${creatorId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return response.data.courses || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch courses by creator'
      );
    }
  }
);

export const searchCourses = createAsyncThunk<
  Course[],
  { keyword: string; tags: string },
  { rejectValue: string }
>('mentor/searchCourses', async ({ keyword, tags }, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${mentorApiUrl}/course/search`, {
      params: { keyword, tags },
    });
    return response?.data?.courses || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to search courses'
    );
  }
});

export const fetchTagsAndCategories = createAsyncThunk<
  Tag[],
  void,
  { rejectValue: string }
>('mentor/fetchTagsAndCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${mentorApiUrl}/course/categoryAndTags`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch tags'
    );
  }
});

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create course
    builder
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;
          state.courses.push(action.payload);
        }
      )
      .addCase(
        createCourse.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to create the course';
        }
      );

    // Update course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;
          state.courses = state.courses.map((course) =>
            course.title === action.payload.title ? action.payload : course
          );
        }
      )
      .addCase(
        updateCourse.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to update the course';
        }
      );

    // Fetch all courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCourses.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          state.loading = false;
          state.courses = action.payload; // Store fetched courses
        }
      )
      .addCase(
        fetchCourses.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch courses';
        }
      );

    // Fetch courses by creator
    builder
      .addCase(fetchCoursesByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCoursesByCreator.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          state.loading = false;
          state.creatorCourses = action.payload;
        }
      )
      .addCase(
        fetchCoursesByCreator.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch courses by creator';
        }
      );

    // Delete course
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteCourse.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.courses = state.courses.filter(
            (course) => course.title !== action.payload
          );
        }
      )
      .addCase(
        deleteCourse.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to delete the course';
        }
      );
    builder
      .addCase(searchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchCourses.fulfilled,
        (state, action: PayloadAction<Course[]>) => {
          state.loading = false;
          state.courses = action.payload;
        }
      )
      .addCase(
        searchCourses.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to search courses';
        }
      );

    builder
      .addCase(createChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createChapter.fulfilled,
        (state, action: PayloadAction<Chapter>) => {
          state.loading = false;
          state.chapters.push(action.payload);
        }
      )
      .addCase(
        createChapter.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to create chapter';
        }
      );
    builder
      .addCase(getCourseChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCourseChapter.fulfilled,
        (state, action: PayloadAction<Chapter[]>) => {
          state.loading = false;
          state.chapters = action.payload; // Store fetched chapters
        }
      )
      .addCase(
        getCourseChapter.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch course chapters';
        }
      );

    builder
      .addCase(updateChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateChapter.fulfilled,
        (state, action: PayloadAction<Chapter>) => {
          state.loading = false;
          const index = state.chapters.findIndex(
            (chapter) => chapter.title === action.payload.title
          );
          if (index !== -1) {
            state.chapters[index] = action.payload;
          }
        }
      )
      .addCase(
        updateChapter.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to update chapter';
        }
      );

    builder
      .addCase(getChapter.pending, (state) => {
        state.chapterData.loading = true; // Correctly set loading state
        state.chapterData.error = null;
      })
      .addCase(
        getChapter.fulfilled,
        (state, action: PayloadAction<Chapter>) => {
          state.chapterData.loading = false;
          if (!action.payload) {
            console.error('Received invalid chapter payload:', action.payload);
            state.chapterData.error = 'Invalid chapter data';
            return;
          }
          state.chapterData.chapter = action.payload;
          state.chapterData.error = null;
        }
      )
      .addCase(
        getChapter.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.chapterData.loading = false;
          state.chapterData.error =
            action.payload || 'Failed to fetch chapter details';
          console.error('Fetch chapter failed with error:', action.payload);
        }
      );
    builder
      .addCase(deleteChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteChapter.fulfilled,
        (state, action: PayloadAction<{ chapterId: string }>) => {
          state.loading = false;
          // Remove the deleted chapter from the state
          state.chapters = state.chapters.filter(
            (chapter) => chapter._id !== action.payload.chapterId
          );
        }
      )
      .addCase(
        deleteChapter.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to delete chapter';
        }
      )

      .addCase(fetchTagsAndCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchTagsAndCategories.fulfilled,
        (state, action: PayloadAction<Tag[]>) => {
          state.loading = false;
          state.tags = action.payload;
        }
      )
      .addCase(
        fetchTagsAndCategories.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Error fetching tags';
        }
      );
  },
});

export default mentorSlice.reducer;
