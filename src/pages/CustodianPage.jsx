import { Routes, Route, Navigate } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import CustodianDashboard from '../components/custodian/CustodianDashboard';
import IssueReturn from '../components/custodian/IssueReturn';
import FinesEngine from '../components/custodian/FinesEngine';
import ReportsHub from '../components/custodian/ReportsHub';
import Recommendations from '../components/custodian/Recommendations';
import Reservations from '../components/custodian/Reservations';
import BookCondition from '../components/custodian/BookCondition';
import LibraryEvents from '../components/custodian/LibraryEvents';
import NexusCommLink from '../components/shared/NexusCommLink';
import PersonnelManager from '../components/admin/PersonnelManager';
import CustodianSettings from '../components/custodian/CustodianSettings';

export default function CustodianPage() {
  return (
    <PageShell role="custodian">
      <Routes>
        <Route index element={<CustodianDashboard />} />
        <Route path="users" element={<PersonnelManager manageableRoles={['student', 'faculty']} />} />
        <Route path="settings" element={<CustodianSettings />} />
        <Route path="issue" element={<IssueReturn />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="fines" element={<FinesEngine />} />
        <Route path="reports" element={<ReportsHub />} />
        <Route path="condition" element={<BookCondition />} />
        <Route path="events" element={<LibraryEvents />} />
        <Route path="comms" element={<NexusCommLink />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="*" element={<Navigate to="/custodian" replace />} />
      </Routes>
    </PageShell>
  );
}
