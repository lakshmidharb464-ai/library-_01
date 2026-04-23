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

// ✅ Protected Route
function ProtectedRoute({ role, children }) {
  const { currentRole } = useLibrary();

  if (!currentRole) return <Navigate to="/" replace />;
  if (role && currentRole !== role) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <>
      <SpectralNotificationContainer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        
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