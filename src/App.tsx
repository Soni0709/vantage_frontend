import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastProvider, ThemeProvider } from './contexts';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profiles/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RecurringTransactionsPage from './pages/transactions/RecurringTransactionsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import BudgetsPage from './pages/budgets/BudgetsPage';
import SavingsGoalsPage from './pages/savingsGoals/SavingsGoalsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ApiConnectionStatus from './components/common/ApiConnectionStatus';
import ConnectionTester from './components/common/ConnectionTester';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              {/* API Connection Status */}
            <ApiConnectionStatus />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/test-connection" element={<ConnectionTester />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Dashboard Route */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Transactions Route */}
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              } />
              
              {/* Budgets Route */}
              <Route path="/budgets" element={
                <ProtectedRoute>
                  <BudgetsPage />
                </ProtectedRoute>
              } />
              
              {/* Analytics Route */}
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              
              {/* Recurring Transactions Route */}
              <Route path="/recurring" element={
                <ProtectedRoute>
                  <RecurringTransactionsPage />
                </ProtectedRoute>
              } />
              
              {/* Savings Goals Route */}
              <Route path="/savings-goals" element={
                <ProtectedRoute>
                  <SavingsGoalsPage />
                </ProtectedRoute>
              } />
              
              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
