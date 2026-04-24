import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryProvider, useLibrary } from './LibraryContext';

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

/**
 * A minimal consumer component that exposes context values
 * through data-testid attributes so tests can read them easily.
 */
function TestConsumer({ onMount } = {}) {
  const ctx = useLibrary();

  // Call onMount once with the full context so tests can capture it
  const ref = { called: false };
  if (onMount && !ref.called) {
    ref.called = true;
    // Delay to after first paint via a ref-safe approach — just pass ctx out
    onMount(ctx);
  }

  return (
    <div>
      <span data-testid="role">{ctx.currentRole ?? 'null'}</span>
      <span data-testid="user-name">{ctx.currentUser?.name ?? 'null'}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
    </div>
  );
}

/** Renders the provider + consumer and waits for initial loading to settle. */
async function renderProvider(onMount) {
  let result;
  await act(async () => {
    result = render(
      <LibraryProvider>
        <TestConsumer onMount={onMount} />
      </LibraryProvider>
    );
  });
  return result;
}

/* ─────────────────────────────────────────────────────────────
   fetch mock factory
───────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:5000/api';

/**
 * Build a per-route fetch stub.
 * @param {Record<string, {status: number, body: object}>} routes
 */
function mockFetch(routes) {
  return vi.fn(async (url, opts = {}) => {
    // Strip the API_BASE prefix to get the relative path
    const path = url.replace(API_BASE, '');
    const key = `${opts.method ?? 'GET'} ${path}`;
    // Try exact key, then path-only fallback (GET)
    const match = routes[key] ?? routes[`GET ${path}`] ?? routes[path];
    const { status = 200, body = {} } = match ?? { status: 200, body: { success: true, data: [] } };

    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  });
}

/* ─────────────────────────────────────────────────────────────
   Default success stub for all the data-fetch calls made in
   fetchData() so they don't fail with "unexpected call" noise.
───────────────────────────────────────────────────────────── */
const successEmpty = { status: 200, body: { success: true, data: [] } };
const defaultRoutes = {
  'GET /books':                     successEmpty,
  'GET /status':                    { status: 200, body: { success: true, message: 'OK', dbConnected: true } },
  'GET /users':                     successEmpty,
  'GET /transactions':              successEmpty,
  'GET /transactions/stats':        { status: 200, body: { success: true, data: {} } },
  'GET /audit':                     successEmpty,
  'GET /settings':                  { status: 200, body: { success: true, data: {} } },
  'GET /faculty/syllabi':           successEmpty,
  'GET /faculty/bibliographies':    successEmpty,
  'GET /faculty/progress':          successEmpty,
  'GET /faculty/recommendations':   successEmpty,
};

/* ─────────────────────────────────────────────────────────────
   LocalStorage stub
───────────────────────────────────────────────────────────── */
const lsStore = {};
const localStorageMock = {
  getItem: vi.fn((k) => lsStore[k] ?? null),
  setItem: vi.fn((k, v) => { lsStore[k] = v; }),
  removeItem: vi.fn((k) => { delete lsStore[k]; }),
  clear: vi.fn(() => { Object.keys(lsStore).forEach(k => delete lsStore[k]); }),
};
vi.stubGlobal('localStorage', localStorageMock);

/* ─────────────────────────────────────────────────────────────
   Tests
───────────────────────────────────────────────────────────── */

describe('LibraryProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /* ── Smoke test ────────────────────────────────────────────── */
  it('renders children without crashing', async () => {
    global.fetch = mockFetch(defaultRoutes);

    await renderProvider();
    expect(screen.getByTestId('role').textContent).toBe('null'); // unauthenticated by default
  });

  /* ── Login ─────────────────────────────────────────────────── */
  describe('login()', () => {
    it('sets currentUser and currentRole on success', async () => {
      const fakeUser = { id: 'u1', name: 'Aarav Sharma', email: 'aarav@lib.edu', role: 'student', department: 'CS' };

      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/login': {
          status: 200,
          body: { success: true, accessToken: 'tok_abc', data: fakeUser },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await act(async () => {
        await ctx.login({ email: 'aarav@lib.edu', password: 'demo123' });
      });

      await waitFor(() =>
        expect(screen.getByTestId('role').textContent).toBe('student')
      );
      expect(screen.getByTestId('user-name').textContent).toBe('Aarav Sharma');
    });

    it('persists token to localStorage on successful login', async () => {
      const fakeUser = { id: 'u1', name: 'Aarav', email: 'aarav@lib.edu', role: 'student', department: 'CS' };

      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/login': {
          status: 200,
          body: { success: true, accessToken: 'tok_stored', data: fakeUser },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await act(async () => {
        await ctx.login({ email: 'aarav@lib.edu', password: 'demo123' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'LIBRANOVA_AUTH',
        expect.stringContaining('tok_stored')
      );
    });

    it('throws on invalid credentials (401)', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/login': {
          status: 400,
          body: { success: false, message: 'Invalid credentials' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.login({ email: 'bad@lib.edu', password: 'wrongpass' });
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  /* ── Forgot Password ───────────────────────────────────────── */
  describe('forgotPassword()', () => {
    it('resolves without throwing on success', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/forgot-password': {
          status: 200,
          body: { success: true, message: 'Reset link sent to email' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.forgotPassword('aarav@lib.edu');
        })
      ).resolves.not.toThrow();
    });

    it('throws when user is not found (404)', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/forgot-password': {
          status: 404,
          body: { success: false, message: 'User not found' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.forgotPassword('ghost@lib.edu');
        })
      ).rejects.toThrow('User not found');
    });
  });

  /* ── Reset Password ────────────────────────────────────────── */
  describe('resetPassword()', () => {
    it('resolves successfully with a valid token', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/reset-password': {
          status: 200,
          body: { success: true, message: 'Password updated successfully' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.resetPassword('valid_token_abc', 'NewSecret@123');
        })
      ).resolves.not.toThrow();
    });

    it('throws with an expired or invalid token', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/reset-password': {
          status: 400,
          body: { success: false, message: 'Invalid or expired token' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.resetPassword('expired_token', 'NewSecret@123');
        })
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  /* ── Verify OTP ────────────────────────────────────────────── */
  describe('verifyOTP()', () => {
    it('sets auth state after successful OTP verification', async () => {
      const fakeUser = { id: 'u2', name: 'Rohan Das', email: 'rohan@lib.edu', role: 'custodian', department: 'Library' };

      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/verify-otp': {
          status: 200,
          body: { success: true, accessToken: 'tok_otp_ok', data: fakeUser },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await act(async () => {
        await ctx.verifyOTP('rohan@lib.edu', '123456');
      });

      await waitFor(() =>
        expect(screen.getByTestId('role').textContent).toBe('custodian')
      );
      expect(screen.getByTestId('user-name').textContent).toBe('Rohan Das');
    });

    it('throws on invalid OTP', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/verify-otp': {
          status: 400,
          body: { success: false, message: 'Invalid OTP' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.verifyOTP('rohan@lib.edu', '000000');
        })
      ).rejects.toThrow('Invalid OTP');
    });

    it('throws on expired OTP', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/verify-otp': {
          status: 400,
          body: { success: false, message: 'OTP expired' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      await expect(
        act(async () => {
          await ctx.verifyOTP('rohan@lib.edu', '654321');
        })
      ).rejects.toThrow('OTP expired');
    });
  });

  /* ── Logout ────────────────────────────────────────────────── */
  describe('logout()', () => {
    it('clears auth state and removes localStorage entry', async () => {
      const fakeUser = { id: 'u1', name: 'Aarav', email: 'aarav@lib.edu', role: 'student', department: 'CS' };

      global.fetch = mockFetch({
        ...defaultRoutes,
        'POST /auth/login': {
          status: 200,
          body: { success: true, accessToken: 'tok_abc', data: fakeUser },
        },
        'POST /auth/logout': { status: 200, body: { success: true, message: 'Logged out' } },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      // First login
      await act(async () => {
        await ctx.login({ email: 'aarav@lib.edu', password: 'demo123' });
      });
      await waitFor(() => expect(screen.getByTestId('role').textContent).toBe('student'));

      // Then logout
      await act(async () => {
        await ctx.logout();
      });

      await waitFor(() => expect(screen.getByTestId('role').textContent).toBe('null'));
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('LIBRANOVA_AUTH');
    });
  });

  /* ── Change Password ───────────────────────────────────────── */
  describe('changePassword()', () => {
    it('resolves with success message', async () => {
      global.fetch = mockFetch({
        ...defaultRoutes,
        'PUT /users/profile/security': {
          status: 200,
          body: { success: true, message: 'Security credentials updated successfully' },
        },
      });

      let ctx;
      await renderProvider((c) => { ctx = c; });

      const result = await act(async () => {
        return ctx.changePassword('oldPass', 'newPass@123');
      });

      expect(result.success).toBe(true);
    });
  });

  /* ── useLibrary guard ──────────────────────────────────────── */
  it('throws when useLibrary is used outside LibraryProvider', () => {
    // Suppress the console.error React prints for uncaught errors in this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useLibrary must be used within LibraryProvider'
    );
    spy.mockRestore();
  });
});
