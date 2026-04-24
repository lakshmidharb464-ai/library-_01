import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from './AuthPage';

/* ─── Mock framer-motion (avoids animation RAF deadlocks) ─────── */
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, tag) => {
      const Tag = tag === 'div' ? 'div' : tag;
      return ({ children, ...rest }) => {
        // Remove framer-specific props
        const { initial, animate, exit, transition, whileHover, whileTap, ...safe } = rest;
        return <div {...safe}>{children}</div>;
      };
    },
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}));

/* ─── Mock CSS modules ────────────────────────────────────────── */
vi.mock('./AuthPage.module.css', () => ({ default: new Proxy({}, { get: (_t, k) => k }) }));

/* ─── Mock LibraryContext ─────────────────────────────────────── */
const mockLogin    = vi.fn();
const mockRegister = vi.fn();
const mockAddToast = vi.fn();

vi.mock('../contexts/LibraryContext', () => ({
  useLibrary: () => ({
    login:    mockLogin,
    register: mockRegister,
    addToast: mockAddToast,
    settings: {},
  }),
}));

/* ─── Mock react-router-dom navigate ─────────────────────────── */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

/* ─── Helper ──────────────────────────────────────────────────── */
function renderAuth(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/auth${search}`]}>
      <AuthPage />
    </MemoryRouter>
  );
}

describe('AuthPage', () => {
  beforeEach(() => vi.clearAllMocks());

  /* ── Rendering ──────────────────────────────────────────────── */
  it('renders login tab by default', () => {
    renderAuth();
    expect(screen.getByText('Nexus Authorization')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AUTHORIZE ACCESS/i })).toBeInTheDocument();
  });

  it('renders quick-access credential cards', () => {
    renderAuth();
    expect(screen.getByText('Admin Nexus')).toBeInTheDocument();
    expect(screen.getByText('Custodian Hub')).toBeInTheDocument();
    expect(screen.getByText('Student Portal')).toBeInTheDocument();
    expect(screen.getByText('Faculty Overmind')).toBeInTheDocument();
  });

  /* ── Tab switching ──────────────────────────────────────────── */
  it('switches to register tab when SIGN UP is clicked', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByRole('button', { name: /SIGN UP/i }));
    expect(screen.getByText('Nexus Enrollment')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
  });

  it('switches back to login tab when LOGIN is clicked', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByRole('button', { name: /SIGN UP/i }));
    await user.click(screen.getByRole('button', { name: /^LOGIN$/i }));
    expect(screen.getByText('Nexus Authorization')).toBeInTheDocument();
  });

  /* ── Forgot password ────────────────────────────────────────── */
  it('navigates to /forgot-password when Forgot Password? is clicked', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByRole('button', { name: /Forgot Password/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  /* ── Quick login ────────────────────────────────────────────── */
  it('quick-login card fills email/password fields and shows toast', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText('Admin Nexus'));
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.stringContaining('Admin Nexus'),
      'info'
    );
  });

  /* ── Login flow ─────────────────────────────────────────────── */
  it('calls login() on form submit and navigates on success', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'student' });
    renderAuth();

    await user.clear(screen.getByPlaceholderText(/name@university.edu/i));
    await user.type(screen.getByPlaceholderText(/name@university.edu/i), 'aarav@lib.edu');
    await user.clear(screen.getByPlaceholderText(/••••••••/i));
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /AUTHORIZE ACCESS/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/student'));
  });

  it('redirects to /verify-otp when twoFactorRequired is true', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ twoFactorRequired: true, role: 'student' });
    renderAuth();

    await user.click(screen.getByRole('button', { name: /AUTHORIZE ACCESS/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', expect.anything())
    );
  });

  it('shows danger toast when login throws', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderAuth();

    await user.click(screen.getByRole('button', { name: /AUTHORIZE ACCESS/i }));

    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith('Invalid credentials', 'danger')
    );
  });

  /* ── Register flow ──────────────────────────────────────────── */
  it('calls register() and navigates to /verify-otp on success', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(true);
    renderAuth();

    await user.click(screen.getByRole('button', { name: /SIGN UP/i }));

    await user.type(screen.getByPlaceholderText(/Enter your name/i), 'Test User');
    await user.clear(screen.getByPlaceholderText(/name@university.edu/i));
    await user.type(screen.getByPlaceholderText(/name@university.edu/i), 'test@lib.edu');
    await user.clear(screen.getByPlaceholderText(/••••••••/i));
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'pass@123');
    await user.click(screen.getByRole('button', { name: /INITIALIZE ACCOUNT/i }));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', expect.anything())
    );
  });

  /* ── Role selection ─────────────────────────────────────────── */
  it('allows role selection between Student / Faculty / Custodian in register tab', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByRole('button', { name: /SIGN UP/i }));

    const facultyBtn = document.getElementById('role-faculty-select');
    expect(facultyBtn).not.toBeNull();
    await user.click(facultyBtn);
    expect(facultyBtn).toBeInTheDocument();
  });

  /* ── Back navigation ────────────────────────────────────────── */
  it('navigates to / when RETURN TO LANDING is clicked', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByRole('button', { name: /RETURN TO LANDING/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
