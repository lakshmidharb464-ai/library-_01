import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

/* ─── Stub shared components ──────────────────────────────────── */
vi.mock('../shared/TelemetryHUD', () => ({
  default: ({ metrics }) => <div data-testid="telemetry-hud">{metrics.length} metrics</div>,
}));
vi.mock('../shared/NeuroPulse', () => ({
  default: () => <div data-testid="neuropulse" />,
}));
vi.mock('./StudentDashboard.module.css', () => ({ default: new Proxy({}, { get: (_t, k) => k }) }));


/* ─── Mock useNavigate ────────────────────────────────────────── */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

/* ─── Default context factory ─────────────────────────────────── */
function makeContext(overrides = {}) {
  return {
    transactions: [],
    books: [],
    currentUser: { id: 'u1', name: 'Aarav Sharma', department: 'CS' },
    calculateFine: () => 0,
    systemStatus: { online: true, dbConnected: true },
    ...overrides,
  };
}

let ctxValues = makeContext();
vi.mock('../../contexts/LibraryContext', () => ({
  useLibrary: () => ctxValues,
}));

function renderDashboard(ctx = {}) {
  ctxValues = makeContext(ctx);
  return render(
    <MemoryRouter>
      <StudentDashboard />
    </MemoryRouter>
  );
}

describe('StudentDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the student name in the header', () => {
    renderDashboard();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
  });

  it('renders STUDENT NEXUS portal tag', () => {
    renderDashboard();
    expect(screen.getByText(/STUDENT NEXUS/i)).toBeInTheDocument();
  });

  it('renders NeuroPulse component', () => {
    renderDashboard();
    expect(screen.getByTestId('neuropulse')).toBeInTheDocument();
  });

  it('renders 4 metrics in TelemetryHUD', () => {
    renderDashboard();
    expect(screen.getByTestId('telemetry-hud')).toHaveTextContent('4 metrics');
  });

  it('shows empty state with INITIATE ARCHIVE SEARCH button when no active transactions', () => {
    renderDashboard();
    expect(screen.getByText(/NO ACTIVE PROTOCOLS/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INITIATE ARCHIVE SEARCH/i })).toBeInTheDocument();
  });

  it('navigates to /student/books when INITIATE ARCHIVE SEARCH is clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /INITIATE ARCHIVE SEARCH/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/student/books');
  });

  it('shows active asset when there is a non-returned transaction', () => {
    const futureDate = new Date(Date.now() + 10 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Deep Learning', author: 'Goodfellow', coverColor: '#6366f1' }],
      transactions: [{ id: 't1', userId: 'u1', bookId: 'b1', status: 'issued', dueDate: futureDate, issueDate: new Date().toISOString() }],
    });
    expect(screen.getByText('Deep Learning')).toBeInTheDocument();
  });

  it('shows CRITICAL BREACH card when there are overdue books', () => {
    const pastDate = new Date(Date.now() - 5 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Overdue Book', author: 'X', coverColor: '#ff4d6d' }],
      transactions: [{ id: 't1', userId: 'u1', bookId: 'b1', status: 'issued', dueDate: pastDate, issueDate: new Date().toISOString() }],
      calculateFine: () => 25,
    });
    expect(screen.getByText(/CRITICAL BREACH/i)).toBeInTheDocument();
  });

  it('navigates to node service routes when system items are clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByText('Reservations'));
    expect(mockNavigate).toHaveBeenCalledWith('/student/reservations');
  });

  it('adds a new telemetry log when TRIGGER TEST PULSE is clicked', () => {
    renderDashboard();
    const before = screen.getAllByText(/NEXUS/i).length;
    fireEvent.click(screen.getByRole('button', { name: /TRIGGER TEST PULSE/i }));
    const after = screen.getAllByText(/NEXUS/i).length;
    expect(after).toBeGreaterThan(before);
  });
});
