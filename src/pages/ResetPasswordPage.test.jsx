import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';

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
  Lock: () => <div data-testid="lock" />,
  CheckCircle: () => <div data-testid="check-circle" />,
  ShieldCheck: () => <div data-testid="shield-check" />,
}));

/* ─── Mock LibraryContext ─────────────────────────────────────── */
const mockResetPassword = vi.fn();
const mockAddToast      = vi.fn();

vi.mock('../contexts/LibraryContext', () => ({
  useLibrary: () => ({
    resetPassword: mockResetPassword,
    addToast:      mockAddToast,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage(token = 'valid_token_abc') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function fill(newPwd, confirmPwd) {
  fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: newPwd } });
  fireEvent.change(screen.getByLabelText(/^Confirm Password$/i), { target: { value: confirmPwd } });
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders the Identity Update form', () => {
    renderPage();
    expect(screen.getByText('Identity Update')).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Set New Password/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', () => {
    renderPage();
    fill('Secret@1234', 'Wrong@9999');
    fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }));
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('shows error when password is shorter than 8 characters', () => {
    renderPage();
    fill('abc', 'abc');
    fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }));
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('shows success message after successful reset', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    renderPage();
    fill('NewSecret@123', 'NewSecret@123');
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }));
    });

    expect(screen.getByText(/Protocol updated/i)).toBeInTheDocument();
  });

  it('navigates to /auth 3 seconds after success', async () => {
    vi.useFakeTimers();
    mockResetPassword.mockResolvedValueOnce(undefined);
    renderPage();
    fill('NewSecret@123', 'NewSecret@123');
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }));
    });
    
    expect(screen.getByText(/Protocol updated/i)).toBeInTheDocument();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('shows error message returned from the API', async () => {
    mockResetPassword.mockRejectedValueOnce(new Error('Invalid or expired token'));
    renderPage();
    fill('NewSecret@123', 'NewSecret@123');
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }));
    });

    expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
  });

  it('calls resetPassword with the correct URL token param', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    renderPage('my_special_token_xyz');
    
    const newPwdInput = screen.getByLabelText(/^New Password$/i);
    const confirmPwdInput = screen.getByLabelText(/^Confirm Password$/i);
    
    fireEvent.change(newPwdInput, { target: { value: 'Secure@Pass1' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'Secure@Pass1' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Set New Password/i }));
    });
    
    expect(mockResetPassword).toHaveBeenCalledWith('my_special_token_xyz', 'Secure@Pass1');
  });
});
