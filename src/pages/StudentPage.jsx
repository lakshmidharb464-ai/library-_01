// StudentPage — routes for the student portal
import { Routes, Route, Navigate } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentMyBooks from '../components/student/StudentMyBooks';
import BrowseBooks from '../components/shared/BrowseBooks';
import Wishlist from '../components/shared/Wishlist';
import StudentReservations from '../components/student/StudentReservations';
import ReadingGoals from '../components/student/ReadingGoals';
import StudyTimer from '../components/student/StudyTimer';
import PeerStudyGroups from '../components/student/PeerStudyGroups';
import NexusCommLink from '../components/shared/NexusCommLink';
import PortalSettings from '../components/shared/PortalSettings';

export default function StudentPage() {
  return (
    <PageShell role="student">
      <Routes>
        <Route index element={<StudentDashboard />} />
        <Route path="settings" element={<PortalSettings />} />
        <Route path="mybooks" element={<StudentMyBooks />} />
        <Route path="browse" element={<BrowseBooks role="student" />} />
        <Route path="reservations" element={<StudentReservations />} />
        <Route path="goals" element={<ReadingGoals />} />
        <Route path="timer" element={<StudyTimer />} />
        <Route path="groups" element={<PeerStudyGroups />} />
        <Route path="comms" element={<NexusCommLink />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </PageShell>
  );
}
