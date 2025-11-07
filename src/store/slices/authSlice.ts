import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChangeRequest,
  ProfileUpdateData
} from '../../types';
import { apiService } from '../../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  registrationLoading: false,
  registrationError: null,
  
  passwordResetLoading: false,
  passwordResetError: null,
  passwordResetEmailSent: false,
  
  profileUpdateLoading: false,
  profileUpdateError: null,
  
  passwordChangeLoading: false,
  passwordChangeError: null,
  
  tokenExpiresAt: null,
  lastActivity: Date.now(),
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      
      // Store tokens and user data
      localStorage.setItem('vantage_token', response.token);
      localStorage.setItem('vantage_refresh_token', response.refreshToken);
      localStorage.setItem('vantage_user', JSON.stringify(response.user));
      
      if (credentials.rememberMe) {
        localStorage.setItem('vantage_remember_me', 'true');
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (registerData: RegisterData, { rejectWithValue }) => {
    try {
      // Validate passwords match
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const response = await apiService.register(registerData);
      
      // Store tokens and user data
      localStorage.setItem('vantage_token', response.token);
      localStorage.setItem('vantage_refresh_token', response.refreshToken);
      localStorage.setItem('vantage_user', JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      
      // Clear all stored data
      localStorage.removeItem('vantage_token');
      localStorage.removeItem('vantage_refresh_token');
      localStorage.removeItem('vantage_user');
      localStorage.removeItem('vantage_remember_me');
      
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (data: PasswordResetRequest, { rejectWithValue }) => {
    try {
      await apiService.requestPasswordReset(data);
      return data.email;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset request failed');
    }
  }
);

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (data: PasswordResetConfirm, { rejectWithValue }) => {
    try {
      await apiService.confirmPasswordReset(data);
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password reset failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: PasswordChangeRequest, { rejectWithValue }) => {
    try {
      await apiService.changePassword(data);
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Password change failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: ProfileUpdateData, { rejectWithValue }) => {
    try {
      const updatedUser = await apiService.updateProfile(data);
      localStorage.setItem('vantage_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  }
);

// Note: updatePreferences is not implemented in API service yet
// Uncomment when API method is ready
/*
export const updatePreferences = createAsyncThunk(
  'auth/updatePreferences',
  async (data: PreferencesUpdateData, { rejectWithValue }) => {
    try {
      const updatedUser = await apiService.updatePreferences(data);
      localStorage.setItem('vantage_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Preferences update failed');
    }
  }
);
*/

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken || localStorage.getItem('vantage_refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiService.refreshToken(refreshToken);
      localStorage.setItem('vantage_token', response.token);
      
      return response;
    } catch (error) {
      // If refresh fails, logout user
      localStorage.clear();
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('vantage_token');
      const refreshToken = localStorage.getItem('vantage_refresh_token');
      const userStr = localStorage.getItem('vantage_user');
      
      if (!token || !userStr) {
        throw new Error('No stored authentication data');
      }
      
      const user = JSON.parse(userStr);
      
      return {
        user,
        token,
        refreshToken,
        expiresIn: 3600000, // Mock expiry
      };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      localStorage.clear();
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.registrationError = null;
      state.passwordResetError = null;
      state.profileUpdateError = null;
      state.passwordChangeError = null;
    },
    clearPasswordResetState: (state) => {
      state.passwordResetLoading = false;
      state.passwordResetError = null;
      state.passwordResetEmailSent = false;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setTokenExpiry: (state, action: PayloadAction<number>) => {
      state.tokenExpiresAt = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiresAt = Date.now() + action.payload.expiresIn;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registrationLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiresAt = Date.now() + action.payload.expiresIn;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.payload as string;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, () => {
        return { ...initialState };
      })
      
      // Password reset cases
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetEmailSent = true;
        state.passwordResetError = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError = action.payload as string;
      })
      
      .addCase(confirmPasswordReset.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetError = null;
        state.passwordResetEmailSent = false;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError = action.payload as string;
      })
      
      // Password change cases
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload as string;
      })
      
      // Profile update cases
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdateLoading = true;
        state.profileUpdateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.user = action.payload;
        state.profileUpdateError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileUpdateError = action.payload as string;
      })
      
      // Preferences update cases
      // Commented out until API method is implemented
      /*
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      */
      
      // Token refresh cases
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.tokenExpiresAt = Date.now() + action.payload.expiresIn;
      })
      .addCase(refreshAuthToken.rejected, () => {
        return { ...initialState };
      })
      
      // Load from storage cases
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiresAt = Date.now() + action.payload.expiresIn;
      });
  },
});

export const { 
  clearAuthError, 
  clearPasswordResetState, 
  updateLastActivity, 
  setTokenExpiry 
} = authSlice.actions;

export default authSlice.reducer;