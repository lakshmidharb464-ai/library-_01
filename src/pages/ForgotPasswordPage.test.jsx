import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';

/* ─── Mock LibraryContext ─────────────────────────────────────── */
const mockForgotPassword = vi.fn();

vi.mock('../contexts/LibraryContext', () => ({
  useLibrary: () => ({ forgotPassword: mockForgotPassword }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the password recovery form', () => {
    renderPage();
    expect(screen.getByText('Password Recovery')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@nexus.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });

  it('shows success message after a valid email is submitted', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(screen.getByPlaceholderText(/name@nexus.com/i), 'test@lib.edu');
    await user.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() =>
      expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /Return to Login/i })).toBeInTheDocument();
  });

  it('shows error message when forgotPassword throws', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockRejectedValueOnce(new Error('User not found'));
    renderPage();

    await user.type(screen.getByPlaceholderText(/name@nexus.com/i), 'ghost@lib.edu');
    await user.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() =>
      expect(screen.getByText('User not found')).toBeInTheDocument()
    );
  });

  it('disables submit button while loading', async () => {
    // A never-resolving promise keeps us in loading state
    mockForgotPassword.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/name@nexus.com/i), 'test@lib.edu');
    await user.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled()
    );
  });

  it('navigates to /auth when "Back to Login" is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Back to Login/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('navigates to /auth from success screen "Return to Login" button', async () => {
    const user = userEvent.setup();
    mockForgotPassword.mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(screen.getByPlaceholderText(/name@nexus.com/i), 'test@lib.edu');
    await user.click(screen.getByRole('button', { name: /Send Reset Link/i }));
    await waitFor(() => screen.getByRole('button', { name: /Return to Login/i }));

    await user.click(screen.getByRole('button', { name: /Return to Login/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});
