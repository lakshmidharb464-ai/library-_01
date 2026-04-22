import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider, useLibrary } from './contexts/LibraryContext';
import SpectralNotificationContainer from './components/common/SpectralNotificationContainer';
import Landing from './pages/Landing';
import AdminPage from './pages/AdminPage';
import LibrarianPage from './pages/LibrarianPage';
import FacultyPage from './pages/FacultyPage';
import StudentPage from './pages/StudentPage';
import AuthPage from './pages/AuthPage';
import NexusAIAssistant from './components/shared/NexusAIAssistant';
import './index.css';

// ✅ Protected Route
function ProtectedRoute({ role, children }) {
  const { currentRole } = useLibrary();

  if (!currentRole) return <Navigate to="/" replace />;
  if (currentRole !== role) return <Navigate to="/" replace />;

  return children;
}

// ✅ Routes
function AppRoutes() {
  return (
    <>
      <SpectralNotificationContainer />
      <NexusAIAssistant />

      <Routes>
        {/* ✅ ALWAYS show Landing first */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* ✅ Role-based pages */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/librarian/*"
          element={
            <ProtectedRoute role="librarian">
              <LibrarianPage />
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

        {/* ✅ Handle wrong URLs */}
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