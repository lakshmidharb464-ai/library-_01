import { useLibrary } from '../../contexts/LibraryContext';
import MyBooks from '../faculty/MyBooks';

// Student "My Books" reuses the faculty MyBooks component (same logic, different loan days)
export default function StudentMyBooks() {
  return <MyBooks role="student" />;
}
