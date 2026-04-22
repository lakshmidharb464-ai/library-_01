import { Routes, Route, Navigate } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import LibrarianDashboard from '../components/librarian/LibrarianDashboard';
import IssueReturn from '../components/librarian/IssueReturn';
import FinesEngine from '../components/librarian/FinesEngine';
import ReportsHub from '../components/librarian/ReportsHub';
import Recommendations from '../components/librarian/Recommendations';
import Reservations from '../components/librarian/Reservations';
import BookCondition from '../components/librarian/BookCondition';
import LibraryEvents from '../components/librarian/LibraryEvents';
import NexusCommLink from '../components/shared/NexusCommLink';
import PersonnelManager from '../components/admin/PersonnelManager';
import PortalSettings from '../components/shared/PortalSettings';

export default function LibrarianPage() {
  return (
    <PageShell role="librarian">
      <Routes>
        <Route index element={<LibrarianDashboard />} />
        <Route path="users" element={<PersonnelManager manageableRoles={['student', 'faculty']} />} />
        <Route path="settings" element={<PortalSettings />} />
        <Route path="issue" element={<IssueReturn />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="fines" element={<FinesEngine />} />
        <Route path="reports" element={<ReportsHub />} />
        <Route path="condition" element={<BookCondition />} />
        <Route path="events" element={<LibraryEvents />} />
        <Route path="comms" element={<NexusCommLink />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="*" element={<Navigate to="/librarian" replace />} />
      </Routes>
    </PageShell>
  );
}
