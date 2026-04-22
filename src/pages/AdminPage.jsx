import { Routes, Route, Navigate } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import AdminDashboard from '../components/admin/AdminDashboard';
import BookCatalog from '../components/admin/BookCatalog';
import PersonnelManager from '../components/admin/PersonnelManager';
import ReviewRequests from '../components/admin/ReviewRequests';
import Analytics from '../components/admin/Analytics';
import ImportExport from '../components/admin/ImportExport';
import BookReviews from '../components/admin/BookReviews';
import Announcements from '../components/admin/Announcements';
import LibrarySettings from '../components/admin/LibrarySettings';
import AuditLogs from '../components/admin/AuditLogs';
import NexusCommLink from '../components/shared/NexusCommLink';

export default function AdminPage() {
  return (
    <PageShell role="admin">
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="books" element={<BookCatalog />} />
        <Route path="users" element={<PersonnelManager manageableRoles={['student', 'faculty', 'librarian', 'admin']} />} />
        <Route path="comms" element={<NexusCommLink />} />
        <Route path="reviews" element={<BookReviews />} />
        <Route path="requests" element={<ReviewRequests />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="logs" element={<AuditLogs />} />
        <Route path="settings" element={<LibrarySettings />} />
        <Route path="io" element={<ImportExport />} />

        {/* Fallback to admin root */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </PageShell>
  );
}
