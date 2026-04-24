import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FacultyDashboard from './FacultyDashboard';

/* ─── Stub heavy deps ─────────────────────────────────────────── */
vi.mock('../shared/TelemetryHUD', () => ({
  default: ({ metrics }) => <div data-testid="telemetry-hud">{metrics.length} metrics</div>,
}));
vi.mock('../shared/NeuroPulse', () => ({
  default: () => <div data-testid="neuropulse" />,
}));
vi.mock('../common/Modal', () => ({
  default: ({ children, title }) => (
    <div data-testid="modal">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
vi.mock('../shared/BookScanner', () => ({
  default: ({ book }) => <div data-testid="book-scanner">{book?.title}</div>,
}));

/* ─── Mock navigate ───────────────────────────────────────────── */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

/* ─── Context factory ─────────────────────────────────────────── */
function makeCtx(overrides = {}) {
  return {
    transactions: [],
    books: [],
    currentUser: { id: 'f1', name: 'Prof Mehta', department: 'Physics' },
    calculateFine: () => 0,
    recommendations: [],
    systemStatus: { online: true, dbConnected: true },
    reviews: [],
    ...overrides,
  };
}

let ctxValues = makeCtx();
vi.mock('../../contexts/LibraryContext', () => ({
  useLibrary: () => ctxValues,
}));

function renderDashboard(ctx = {}) {
  ctxValues = makeCtx(ctx);
  return render(
    <MemoryRouter>
      <FacultyDashboard />
    </MemoryRouter>
  );
}

describe('FacultyDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the FACULTY OVERMIND portal tag', () => {
    renderDashboard();
    expect(screen.getByText(/FACULTY OVERMIND/i)).toBeInTheDocument();
  });

  it('shows the faculty member name', () => {
    renderDashboard();
    expect(screen.getByText('Prof Mehta')).toBeInTheDocument();
  });

  it('renders NeuroPulse component', () => {
    renderDashboard();
    expect(screen.getByTestId('neuropulse')).toBeInTheDocument();
  });

  it('passes 4 metrics to TelemetryHUD', () => {
    renderDashboard();
    expect(screen.getByTestId('telemetry-hud')).toHaveTextContent('4 metrics');
  });

  it('shows empty state when no active assets', () => {
    renderDashboard();
    expect(screen.getByText(/NO ACTIVE ASSETS IN CURRENT SECTOR/i)).toBeInTheDocument();
  });

  it('renders active book asset when there is an active transaction', () => {
    const futureDate = new Date(Date.now() + 15 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Quantum Theory', author: 'Bohr', coverColor: '#7b2fff' }],
      transactions: [{
        id: 't1', userId: 'f1', bookId: 'b1',
        status: 'issued', issueDate: new Date().toISOString(), dueDate: futureDate,
      }],
    });
    expect(screen.getByText('Quantum Theory')).toBeInTheDocument();
  });

  it('shows PROTOCOL BREACH card when faculty has overdue assets', () => {
    const pastDate = new Date(Date.now() - 7 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Overdue Book', author: 'X', coverColor: '#ff4d6d' }],
      transactions: [{
        id: 't2', userId: 'f1', bookId: 'b1',
        status: 'issued', issueDate: new Date().toISOString(), dueDate: pastDate,
      }],
      calculateFine: () => 70,
    });
    expect(screen.getByText(/PROTOCOL BREACH/i)).toBeInTheDocument();
    expect(screen.getByText(/IMMEDIATE RESTORATION/i)).toBeInTheDocument();
  });

  it('navigates to correct link when CORE SYSTEMS items are clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByText('Syllabi'));
    expect(mockNavigate).toHaveBeenCalledWith('/faculty/syllabus');
  });

  it('adds NEURAL PULSE log when TRIGGER PULSE is clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /TRIGGER PULSE/i }));
    expect(screen.getByText(/NEURAL PULSE BROADCASTED/i)).toBeInTheDocument();
  });

  it('opens Modal with BookScanner when an active asset is clicked', () => {
    const futureDate = new Date(Date.now() + 15 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Relativity', author: 'Einstein', coverColor: '#7b2fff' }],
      transactions: [{
        id: 't1', userId: 'f1', bookId: 'b1',
        status: 'issued', issueDate: new Date().toISOString(), dueDate: futureDate,
      }],
    });
    fireEvent.click(screen.getByText('Relativity'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('book-scanner')).toHaveTextContent('Relativity');
  });
});
