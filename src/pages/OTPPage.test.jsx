import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OTPPage from './OTPPage';

/* ─── Suppress framer-motion animation RAF deadlocks ─────────── */
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

/* ─── Mock lucide-react ───────────────────────────────────────── */
vi.mock('lucide-react', () => ({
  ShieldAlert: () => <div data-testid="shield-alert" />,
  RefreshCw: () => <div data-testid="refresh-cw" />,
  ArrowLeft: () => <div data-testid="arrow-left" />,
}));

/* ─── Mock LibraryContext ─────────────────────────────────────── */
const mockVerifyOTP = vi.fn();
const mockResendOTP = vi.fn();
const mockAddToast  = vi.fn();

vi.mock('../contexts/LibraryContext', () => ({
  useLibrary: () => ({
    verifyOTP:  mockVerifyOTP,
    resendOTP:  mockResendOTP,
    addToast:   mockAddToast,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderOTPPage(email = 'test@lib.edu') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/verify-otp', state: { email } }]}>
      <OTPPage />
    </MemoryRouter>
  );
}

function fillOTPBoxes(digits = '123456') {
  const inputs = screen.getAllByRole('textbox');
  digits.split('').forEach((d, i) =>
    fireEvent.change(inputs[i], { target: { value: d } })
  );
}

describe('OTPPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders the Identity Shield heading and email', () => {
    renderOTPPage('aarav@lib.edu');
    expect(screen.getByText('Identity Shield')).toBeInTheDocument();
    expect(screen.getByText('aarav@lib.edu')).toBeInTheDocument();
  });

  it('renders 6 OTP input boxes', () => {
    renderOTPPage();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('redirects to /auth when no email is in location state', () => {
    render(
      <MemoryRouter initialEntries={['/verify-otp']}>
        <OTPPage />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('shows error when less than 6 digits are entered', async () => {
    renderOTPPage();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    await waitFor(() => expect(screen.getByText(/6-digit/i)).toBeInTheDocument());
  });

  it('calls verifyOTP and navigates on success', async () => {
    mockVerifyOTP.mockResolvedValueOnce({ role: 'student' });
    renderOTPPage();
    fillOTPBoxes('123456');
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    await waitFor(() => expect(mockVerifyOTP).toHaveBeenCalledWith('test@lib.edu', '123456'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/student'));
  });

  it('shows error message when verifyOTP throws', async () => {
    mockVerifyOTP.mockRejectedValueOnce(new Error('Invalid OTP'));
    renderOTPPage();
    fillOTPBoxes('000000');
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    await waitFor(() => expect(screen.getByText('Invalid OTP')).toBeInTheDocument());
  });

  it('shows countdown timer (30s) initially', () => {
    renderOTPPage();
    expect(screen.getByText(/30s/i)).toBeInTheDocument();
  });

  it('shows Resend Signal button after timer expires', () => {
    vi.useFakeTimers();
    renderOTPPage();
    
    act(() => {
      vi.advanceTimersByTime(31000);
    });

    expect(screen.getByRole('button', { name: /Resend Signal/i })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('calls resendOTP and resets timer when Resend Signal is clicked', async () => {
    vi.useFakeTimers();
    mockResendOTP.mockResolvedValueOnce(undefined);
    renderOTPPage();

    act(() => {
      vi.advanceTimersByTime(31000);
    });

    const resendBtn = screen.getByRole('button', { name: /Resend Signal/i });
    
    // We still need to await the resendOTP call if it's async in the component
    await act(async () => {
      fireEvent.click(resendBtn);
    });
    
    expect(mockResendOTP).toHaveBeenCalledWith('test@lib.edu');
    expect(screen.getByText(/30s/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('navigates to /auth when Change Email is clicked', () => {
    renderOTPPage();
    fireEvent.click(screen.getByRole('button', { name: /Change Email/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});
