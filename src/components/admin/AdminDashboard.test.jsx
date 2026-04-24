import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

/* ─── Stub heavy shared components ───────────────────────────── */
vi.mock('../shared/TelemetryHUD',    () => ({ default: ({ metrics }) => <div data-testid="telemetry-hud">{metrics.length} metrics</div> }));
vi.mock('./SystemHealthChart',       () => ({ default: ({ label }) => <div data-testid="health-chart">{label}</div> }));

/* ─── Default context values ──────────────────────────────────── */
const mockGetStats = vi.fn(() => ({
  totalBooks: 120,
  totalUsers: 35,
  activeIssues: 8,
  overdueCount: 3,
  pendingFines: 450,
  pendingRecommendations: 2,
  systemSync: 'ONLINE',
  onlineStatus: 'ONLINE',
  availableBooks: 112,
}));

vi.mock('../../contexts/LibraryContext', () => ({
  useLibrary: () => ({
    getStats:    mockGetStats,
    transactions: [],
    books: [
      { id: 'b1', title: 'Nexus Code', author: 'A. Smith', copies: 3, available: 2, coverColor: '#00ffc8' },
    ],
    users: [],
    currentUser: { name: 'Admin One', id: 'a1' },
    systemStatus: { online: true, dbConnected: true },
    auditLogs: [],
  }),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

describe('AdminDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the Admin Nexus heading', () => {
    renderDashboard();
    expect(screen.getByText('Admin Nexus')).toBeInTheDocument();
  });

  it('displays the current admin\'s name in the subtitle', () => {
    renderDashboard();
    expect(screen.getByText(/Admin One/i)).toBeInTheDocument();
  });

  it('calls getStats() and passes metrics to TelemetryHUD', () => {
    renderDashboard();
    expect(mockGetStats).toHaveBeenCalled();
    // TelemetryHUD stub shows "<n> metrics"
    expect(screen.getByTestId('telemetry-hud')).toHaveTextContent('7 metrics');
  });

  it('renders both SystemHealthChart panels', () => {
    renderDashboard();
    const charts = screen.getAllByTestId('health-chart');
    expect(charts).toHaveLength(2);
    expect(charts[0]).toHaveTextContent('Neural Load Telemetry');
    expect(charts[1]).toHaveTextContent('Security Integrity Sync');
  });

  it('renders the Recent Transactions table headers', () => {
    renderDashboard();
    expect(screen.getByText('Resource Asset')).toBeInTheDocument();
    expect(screen.getByText('Member Entity')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows a book in the Inventory Telemetry section', () => {
    renderDashboard();
    expect(screen.getByText('Nexus Code')).toBeInTheDocument();
    expect(screen.getByText('A. Smith')).toBeInTheDocument();
  });

  it('shows the System Live badge', () => {
    renderDashboard();
    expect(screen.getByText(/System Live/i)).toBeInTheDocument();
  });
});
