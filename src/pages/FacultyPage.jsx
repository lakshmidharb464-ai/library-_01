import { Routes, Route, Navigate } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import FacultyDashboard from '../components/faculty/FacultyDashboard';
import MyBooks from '../components/faculty/MyBooks';
import BrowseBooks from '../components/shared/BrowseBooks';
import AcquisitionRecommender from '../components/faculty/AcquisitionRecommender';
import Wishlist from '../components/shared/Wishlist';
import ReadingProgress from '../components/faculty/ReadingProgress';
import Bibliography from '../components/faculty/Bibliography';
import SyllabusBuilder from '../components/faculty/SyllabusBuilder';
import NexusCommLink from '../components/shared/NexusCommLink';
import PersonnelManager from '../components/admin/PersonnelManager';
import PortalSettings from '../components/shared/PortalSettings';

export default function FacultyPage() {
  return (
    <PageShell role="faculty">
      <Routes>
        <Route index element={<FacultyDashboard />} />
        <Route path="users" element={<PersonnelManager manageableRoles={['student']} />} />
        <Route path="settings" element={<PortalSettings />} />
        <Route path="mybooks" element={<MyBooks />} />
        <Route path="browse" element={<BrowseBooks role="faculty" />} />
        <Route path="progress" element={<ReadingProgress />} />
        <Route path="bibliography" element={<Bibliography />} />
        <Route path="syllabus" element={<SyllabusBuilder />} />
        <Route path="recommend" element={<AcquisitionRecommender />} />
        <Route path="comms" element={<NexusCommLink />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="*" element={<Navigate to="/faculty" replace />} />
      </Routes>
    </PageShell>
  );
}
