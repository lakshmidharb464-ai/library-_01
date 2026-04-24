import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider, useLibrary } from './contexts/LibraryContext';
import SpectralNotificationContainer from './components/common/SpectralNotificationContainer';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import CustodianPage from './pages/CustodianPage';
import FacultyPage from './pages/FacultyPage';
import StudentPage from './pages/StudentPage';
import ProfileSettings from './pages/ProfileSettings';
import OTPPage from './pages/OTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ✅ Protected Route
function ProtectedRoute({ role, children }) {
  const { currentRole } = useLibrary();

  const normalizedCurrentRole = currentRole?.toLowerCase();
  const normalizedTargetRole = role?.toLowerCase();

  if (!normalizedCurrentRole) return <Navigate to="/" replace />;
  if (normalizedTargetRole && normalizedCurrentRole !== normalizedTargetRole) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <>
      <SpectralNotificationContainer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/custodian/*"
          element={
            <ProtectedRoute role="custodian">
              <CustodianPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/*"
          element={
            <ProtectedRoute role="faculty">
              <FacultyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="student">
              <StudentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ✅ Main App
function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <AppRoutes />
      </LibraryProvider>
    </BrowserRouter>
  );
}
export default App;