// Import core RTK Query tools
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index'; // For accessing global Redux state typing

// ✅ Step 1: Define the base URL for all API calls
// It comes from an environment variable (VITE_API_BASE_URL)
// or falls back to local development server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';


// ✅ Step 2: Create a "baseQuery"
//    This is the foundation for all API calls (like a custom fetch wrapper).
//    It automatically attaches headers such as Authorization, Content-Type, etc.
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL, // every request starts with this URL

  // prepareHeaders lets you modify headers before every API request
  prepareHeaders: (headers, { getState }) => {
    // 🔹 Get the token from Redux store if available, otherwise from localStorage
    const token = (getState() as RootState).auth.token || localStorage.getItem('vantage_token');
    
    // 🔹 If token exists, attach it to the Authorization header
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Always tell the server that the request body is JSON
    headers.set('Content-Type', 'application/json');
    
    // Return the final headers object
    return headers;
  },
});


// ✅ Step 3: Create a "baseQueryWithReauth"
//    This is a wrapper around baseQuery that adds automatic token refresh logic.
const baseQueryWithReauth: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // 🔹 Make the first request using the baseQuery
  let result = await baseQuery(args, api, extraOptions);
  
  // 🔹 If the server responds with 401 (Unauthorized), it means token expired or invalid
  if (result.error && result.error.status === 401) {
    // Try to get a refresh token from localStorage
    const refreshToken = localStorage.getItem('vantage_refresh_token');
    
    // 🔹 If refresh token exists, attempt to refresh access token
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',    // endpoint to refresh the token
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );
      
      // 🔹 If refresh successful, the backend will send a new token
      if (refreshResult.data) {
        const data = refreshResult.data as Record<string, unknown>;

        // ✅ Check if the response indicates success and has a valid new token
        if (data.success && (data.data as Record<string, unknown>)?.token) {
          // Save the new token in localStorage
          localStorage.setItem('vantage_token', (data.data as Record<string, unknown>).token as string);
          
          // 🔁 Retry the original failed request with the new token
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // ❌ If refresh request fails → clear everything and redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      // ❌ If no refresh token found → also logout
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  
  // ✅ Return final result (either original success or retry result)
  return result;
};


// ✅ Step 4: Create the base API instance
//    This is the "root API slice" all other feature APIs will extend from.
export const baseApi = createApi({
  // A unique key in Redux store for this API
  reducerPath: 'api',

  // Use our enhanced base query with re-auth capability
  baseQuery: baseQueryWithReauth,

  // Define tag types for cache management
  // These tags let RTK Query know which cached data to invalidate/refetch when changes happen
  tagTypes: [
    'Transaction',
    'RecurringTransaction',
    'Summary',
    'Category',
    'Budget',
    'Alert',
    'SavingsGoal',
  ],

  // For now, no endpoints here — feature APIs will "inject" theirs later
  endpoints: () => ({}),
});
