import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import monthlyBudgetReducer, { budgetListenerMiddleware } from './slices/monthlyBudgetSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    monthlyBudget: monthlyBudgetReducer,
    // Add the API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(baseApi.middleware) // Add RTK Query middleware
      .prepend(budgetListenerMiddleware.middleware), // Add budget listener middleware
  devTools: import.meta.env.MODE !== 'production',
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
