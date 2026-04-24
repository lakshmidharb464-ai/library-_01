import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustodianDashboard from './CustodianDashboard';

/* ─── Stub TelemetryHUD ───────────────────────────────────────── */
vi.mock('../shared/TelemetryHUD', () => ({
  default: ({ metrics }) => <div data-testid="telemetry-hud">{metrics.length} metrics</div>,
}));

/* ─── Default context factory ─────────────────────────────────── */
function makeCtx(overrides = {}) {
  return {
    transactions: [],
    books: [],
    users: [],
    calculateFine: () => 0,
    currentUser: { id: 'c1', name: 'Rohan Das', role: 'custodian' },
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
      <CustodianDashboard />
    </MemoryRouter>
  );
}

describe('CustodianDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the Nexus Custodian Hub heading', () => {
    renderDashboard();
    expect(screen.getByText('Nexus Custodian Hub')).toBeInTheDocument();
  });

  it('shows the custodian name', () => {
    renderDashboard();
    expect(screen.getByText(/Rohan Das/)).toBeInTheDocument();
  });

  it('passes 5 metrics to TelemetryHUD', () => {
    renderDashboard();
    expect(screen.getByTestId('telemetry-hud')).toHaveTextContent('5 metrics');
  });

  it('shows no-active-loans row when transactions are empty', () => {
    renderDashboard();
    expect(screen.getByText(/No active loans registered/i)).toBeInTheDocument();
  });

  it('shows active loan in the table', () => {
    const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Unix Power', author: 'K. Thompson', coverColor: '#7b2fff' }],
      users: [{ id: 'u1', name: 'Aarav Sharma', role: 'student' }],
      transactions: [{
        id: 't1', userId: 'u1', bookId: 'b1',
        status: 'issued', issueDate: new Date().toISOString(), dueDate: futureDate,
      }],
    });
    expect(screen.getByText('Unix Power')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows CRITICAL PROTOCOL BREACH alert when there are overdue books', () => {
    const pastDate = new Date(Date.now() - 3 * 86400000).toISOString();
    renderDashboard({
      books: [{ id: 'b1', title: 'Overdue Book', author: 'X', coverColor: '#ff4d6d' }],
      users: [{ id: 'u2', name: 'User Two', role: 'student' }],
      transactions: [{
        id: 't2', userId: 'u2', bookId: 'b1',
        status: 'issued', issueDate: new Date().toISOString(), dueDate: pastDate,
      }],
    });
    expect(screen.getByText(/CRITICAL PROTOCOL BREACH/i)).toBeInTheDocument();
    expect(screen.getByText('BREACH')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    renderDashboard();
    expect(screen.getByText('Resource Asset')).toBeInTheDocument();
    expect(screen.getByText('Member Entity')).toBeInTheDocument();
    expect(screen.getByText('Status Marker')).toBeInTheDocument();
  });
});
