import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const AUTH_API_URL = import.meta.env.VITE_API_URL;

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  roles: string[];
}

interface LoginPayload {
  email: string;
  password: string;
}

interface PasswordResetPayload {
  email: string;
}

interface ResetPasswordPayload {
  email: string;
  password: string;
  otp: string;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
  user: {
    userId: string;
    token: {
      access: {
        token: string;
      };
    };
    roles: string[];
  } | null;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  success: false,
  user: null,
};

// Action to clear user data and redirect to login
export const handleTokenExpiration = () => (dispatch: AppDispatch) => {
  dispatch(resetAuthState()); // clear auth state
  sessionStorage.removeItem('authToken'); // clear token from sessionStorage
  const navigate = useNavigate();
  navigate('/login'); // redirect to login
};

// Axios interceptor for handling expired tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized access
      const dispatch = useDispatch<AppDispatch>();
      dispatch(handleTokenExpiration());
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>('auth/getUserProfile', async (_, { rejectWithValue }) => {
  try {
    const authToken = sessionStorage.getItem('authToken');
    const response = await axios.get(`${AUTH_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch user profile'
    );
  }
});

// Register User
export const registerUser = createAsyncThunk<
  any,
  RegisterPayload,
  { rejectValue: string }
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/auth/register`,
      userData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Registration failed'
    );
  }
});

// Login User
export const loginUser = createAsyncThunk<
  any,
  LoginPayload,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/auth/login`,
      credentials
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

// Trigger Password Reset
export const triggerPasswordReset = createAsyncThunk<
  any,
  PasswordResetPayload,
  { rejectValue: string }
>('auth/triggerPasswordReset', async (emailData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/auth/triggerPasswordReset`,
      emailData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Password reset failed'
    );
  }
});

// Reset Password
export const resetPassword = createAsyncThunk<
  any,
  ResetPasswordPayload,
  { rejectValue: string }
>('auth/resetPassword', async (resetData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/auth/resetPassword`,
      resetData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Password reset failed'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login Success Payload:', action.payload);
        state.loading = false;
        state.success = true;
        state.user = {
          userId: action.payload.userId,
          token: action.payload.token, // ensure this matches your expected structure
          roles: action.payload.roles || [],
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
      })

      // Trigger Password Reset
      .addCase(triggerPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(triggerPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(triggerPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
