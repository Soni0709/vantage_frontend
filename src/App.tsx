import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RecurringTransactionsPage from './pages/RecurringTransactionsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ApiConnectionStatus from './components/ApiConnectionStatus';
import ConnectionTester from './components/ConnectionTester';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          {/* API Connection Status */}
          <ApiConnectionStatus />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/test-connection" element={<ConnectionTester />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Dashboard Route - Updated with new DashboardPage */}
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
            
            {/* Recurring Transactions Route */}
            <Route path="/recurring" element={
              <ProtectedRoute>
                <RecurringTransactionsPage />
              </ProtectedRoute>
            } />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
