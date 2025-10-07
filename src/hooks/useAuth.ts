import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { updateLastActivity, refreshAuthToken, loadUserFromStorage } from '../store/slices/authSlice';

// Custom auth hooks
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  // Auto-load user from storage on app start
  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, auth.isAuthenticated, auth.isLoading]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (auth.isAuthenticated && auth.tokenExpiresAt) {
      const timeUntilExpiry = auth.tokenExpiresAt - Date.now();
      const refreshTime = timeUntilExpiry - 5 * 60 * 1000; // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        const timeoutId = setTimeout(() => {
          dispatch(refreshAuthToken());
        }, refreshTime);

        return () => clearTimeout(timeoutId);
      } else if (timeUntilExpiry <= 0) {
        // Token expired, refresh immediately
        dispatch(refreshAuthToken());
      }
    }
  }, [dispatch, auth.isAuthenticated, auth.tokenExpiresAt]);

  // Update last activity on user interaction
  useEffect(() => {
    const handleUserActivity = () => {
      if (auth.isAuthenticated) {
        dispatch(updateLastActivity());
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [dispatch, auth.isAuthenticated]);

  return {
    ...auth,
    isLoggedIn: auth.isAuthenticated,
    currentUser: auth.user,
  };
};

// Profile management hook
export const useProfile = () => {
  const auth = useAppSelector(state => state.auth);
  
  return {
    user: auth.user,
    isLoading: auth.profileUpdateLoading,
    error: auth.profileUpdateError,
  };
};

// Password management hook
export const usePasswordManagement = () => {
  const auth = useAppSelector(state => state.auth);
  
  return {
    resetLoading: auth.passwordResetLoading,
    resetError: auth.passwordResetError,
    resetEmailSent: auth.passwordResetEmailSent,
    changeLoading: auth.passwordChangeLoading,
    changeError: auth.passwordChangeError,
  };
};