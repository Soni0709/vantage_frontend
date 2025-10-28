import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Base query with auth token injection
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state or localStorage
    const token = (getState() as RootState).auth.token || localStorage.getItem('vantage_token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshToken = localStorage.getItem('vantage_refresh_token');
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store the new token
        const data = refreshResult.data as any;
        if (data.success && data.data?.token) {
          localStorage.setItem('vantage_token', data.data.token);
          
          // Retry the original query with new token
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      // No refresh token, logout user
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  
  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaction', 'RecurringTransaction', 'Summary', 'Category', 'Budget', 'Alert', 'SavingsGoal'],
  endpoints: () => ({}),
});
