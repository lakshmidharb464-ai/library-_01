import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';

/* ── Constants & Configuration ───────────────────────────────────── */
export const API_BASE = 'http://localhost:5000/api';
const STORAGE_KEY = 'LIBRANOVA_AUTH';

export const DEMO_ACCOUNTS = [
  { role: 'admin',     label: 'Admin',     name: 'System Admin', email: 'admin@lib.edu', universityId: 'ADM-001', password: 'demo123', color: '#ff4d6d' },
  { role: 'librarian', label: 'Librarian', name: 'Rohan Das',    email: 'rohan@lib.edu', universityId: 'LIB-001', password: 'demo123', color: '#00ffc8' },
  { role: 'student',   label: 'Student',   name: 'Aarav Sharma', email: 'aarav@lib.edu', universityId: 'STU-001', password: 'demo123', color: '#00b4d8' },
  { role: 'faculty',   label: 'Faculty',   name: 'Priya Mehta',  email: 'priya@lib.edu', universityId: 'FAC-001', password: 'demo123', color: '#7b2fff' },
];

const INITIAL_SETTINGS = {
  libraryName: 'LibraNova Smart Library',
  finePerDay: 5,
  studentLoanDays: 14,
  facultyLoanDays: 30,
  maxBooksPerStudent: 3,
  maxBooksPerFaculty: 5,
  openTime: '08:00',
  closeTime: '20:00',
  weekendOpen: true,
  emailNotifications: true,
  autoFineCalculation: true,
  ambientTheme: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-background-27202-large.mp4',
  haptic: true,
  animations: true,
  scanlines: true,
  noiseOverlay: true,
  uiCompact: false,
  accentTheme: 'emerald',
};

/* ── Auth Initialization Helper ──────────────────────────────────── */
const getInitialAuth = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { role, user } = JSON.parse(saved);
      return { role, user };
    }
  } catch (e) {
    console.error('Auth Init Error:', e);
  }
  return { role: null, user: null };
};

const savedAuth = getInitialAuth();

const INITIAL_STATE = {
  books: [],
  users: [],
  transactions: [],
  announcements: [
    { id: '1', title: 'System Maintenance', content: 'Scheduled maintenance this Sunday at 02:00 UTC.', date: new Date().toISOString(), important: true },
    { id: '2', title: 'New Arrival', content: 'The latest edition of "Clean Code" is now available.', date: new Date().toISOString(), important: false }
  ],
  notifications: [],
  reviews: [],
  wishlist: [],
  messages: [
    { id: 'm1', senderId: 'u3', receiverId: 'admin_id', content: 'Welcome to the Nexus Comm-Link.', timestamp: new Date().toISOString() }
  ],
  auditLogs: [
    { id: 'l1', action: 'LOGIN', user: 'Admin', details: 'Successful session start', timestamp: new Date().toISOString() }
  ],
  syllabi: [],
  bibliographies: [],
  readingProgress: [],
  recommendations: [],
  reservations: [],
  readingGoals: [],
  studyGroups: [],
  settings: INITIAL_SETTINGS,
  currentRole: savedAuth.role,
  currentUser: savedAuth.user,
  systemStatus: { online: false, dbConnected: false },
};

/* ── Reducer ───────────────────────────────────────────────────── */
function libraryReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH': 
      return { ...state, currentRole: action.role, currentUser: action.user };
    case 'LOGOUT': 
      return { ...state, currentRole: null, currentUser: null };
    case 'SET_DATA': 
      return { ...state, ...action.payload };
    case 'UPDATE_STATUS': 
      return { ...state, systemStatus: action.status };
    case 'UPDATE_SETTINGS': 
      return { ...state, settings: { ...state.settings, ...action.settings } };
    
    // Core Logic Reducers
    case 'ADD_USER':
      return { ...state, users: [action.user, ...state.users] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.user.id ? { ...u, ...action.user } : u) };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.id) };
    
    case 'ADD_BOOK':
      return { ...state, books: [action.book, ...state.books] };
    case 'UPDATE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.book.id ? { ...b, ...action.book } : b) };
    case 'DELETE_BOOK':
      return { ...state, books: state.books.filter(b => b.id !== action.id) };

    case 'ISSUE_BOOK': {
      const tx = action.transaction;
      return { 
        ...state, 
        transactions: [tx, ...state.transactions],
        books: state.books.map(b => b.id === tx.bookId ? { ...b, available: b.available - 1 } : b)
      };
    }
    case 'RETURN_BOOK': {
      const txId = action.transactionId;
      const tx = state.transactions.find(t => t.id === txId);
      if (!tx) return state;
      return {
        ...state,
        transactions: state.transactions.map(t => t.id === txId ? { ...t, status: 'Returned', fine: action.fine, returnDate: action.returnDate } : t),
        books: state.books.map(b => b.id === tx.bookId ? { ...b, available: b.available + 1 } : b)
      };
    }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 50) };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find(w => w.bookId === action.bookId && w.userId === action.userId);
      if (exists) {
        return { ...state, wishlist: state.wishlist.filter(w => w !== exists) };
      }
      return { ...state, wishlist: [...state.wishlist, { userId: action.userId, bookId: action.bookId }] };
    }
    case 'ADD_REVIEW':
      return { ...state, reviews: [action.review, ...state.reviews] };
    case 'DELETE_REVIEW':
      return { ...state, reviews: state.reviews.filter(r => r.id !== action.id) };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'UPDATE_RECOMMENDATION':
      return { ...state, recommendations: state.recommendations.map(r => r.id === action.rec.id ? { ...r, ...action.rec } : r) };
    case 'ADD_RECOMMENDATION':
      return { ...state, recommendations: [action.rec, ...state.recommendations] };
    case 'ADD_SYLLABUS':
      return { ...state, syllabi: [action.syllabus, ...state.syllabi] };
    case 'UPDATE_SYLLABUS':
      return { ...state, syllabi: state.syllabi.map(s => s.id === action.syllabus.id ? action.syllabus : s) };
    case 'DELETE_SYLLABUS':
      return { ...state, syllabi: state.syllabi.filter(s => s.id !== action.id) };
    case 'ADD_BIB_ENTRY':
      return { ...state, bibliographies: [action.entry, ...state.bibliographies] };
    case 'DELETE_BIB_ENTRY':
      return { ...state, bibliographies: state.bibliographies.filter(e => e.id !== action.id) };
    case 'UPSERT_PROGRESS': {
      const existing = state.readingProgress.find(p => p.id === action.progress.id);
      if (existing) {
        return { ...state, readingProgress: state.readingProgress.map(p => p.id === action.progress.id ? action.progress : p) };
      }
      return { ...state, readingProgress: [action.progress, ...state.readingProgress] };
    }
    case 'DELETE_PROGRESS':
      return { ...state, readingProgress: state.readingProgress.filter(p => p.id !== action.id) };
    case 'ADD_ANNOUNCEMENT':
      return { ...state, announcements: [{ id: `ann${Date.now()}`, ...action.ann }, ...state.announcements] };
    case 'DELETE_ANNOUNCEMENT':
      return { ...state, announcements: state.announcements.filter(a => a.id !== action.id) };
    case 'PIN_ANNOUNCEMENT':
      return { ...state, announcements: state.announcements.map(a => a.id === action.id ? { ...a, pinned: !a.pinned } : a) };
    case 'LOG_ACTION':
      return { ...state, auditLogs: [{ id: `log${Date.now()}`, timestamp: new Date().toISOString(), ...action.payload }, ...state.auditLogs].slice(0, 500) };
    case 'IMPORT_DATA':
      return { ...state, ...action.data };
    default: 
      return state;
  }
}

/* ── Context ───────────────────────────────────────────────────── */
const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [state, dispatch] = useReducer(libraryReducer, INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // API Helper
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const auth = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (auth?.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const json = await res.json();
    
    if (!res.ok) {
      if (res.status === 401) {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem(STORAGE_KEY);
      }
      throw new Error(json.message || 'API request failed');
    }
    
    return json;
  }, []);

  // Toast Helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Sync Settings to Body
  useEffect(() => {
    const body = document.body;
    body.className = '';
    if (state.settings.accentTheme) body.classList.add(`theme-${state.settings.accentTheme}`);
    if (state.settings.uiCompact) body.classList.add('ui-compact');
  }, [state.settings]);

  // Fetch Initial Data
  const fetchData = useCallback(async () => {
    try {
      const [booksData, healthData, usersData, txData, auditData, settingsData, syllabiData, bibData, progData, recData] = await Promise.all([
        apiFetch('/books'),
        apiFetch('/status').catch(() => ({ success: true, message: 'Fallback', data: {} })),
        apiFetch('/users').catch(() => ({ success: true, data: [] })),
        apiFetch('/transactions').catch(() => ({ success: true, data: [] })),
        apiFetch('/audit').catch(() => ({ success: true, data: [] })),
        apiFetch('/settings').catch(() => ({ success: true, data: INITIAL_SETTINGS })),
        apiFetch('/faculty/syllabi').catch(() => ({ success: true, data: [] })),
        apiFetch('/faculty/bibliographies').catch(() => ({ success: true, data: [] })),
        apiFetch('/faculty/progress').catch(() => ({ success: true, data: [] })),
        apiFetch('/faculty/recommendations').catch(() => ({ success: true, data: [] })),
      ]);

      const mapBook = (b) => ({
        ...b,
        id: b._id || b.id,
        available: b.availableCopies ?? b.available,
        copies: b.totalCopies ?? b.copies,
        year: b.publishedYear || b.year
      });

      const mapUser = (u) => ({
        ...u,
        id: u._id || u.id,
        status: u.isActive ? 'active' : 'inactive'
      });

      const mapTx = (t) => ({
        ...t,
        id: t._id || t.id,
        userId: typeof t.user === 'object' ? t.user?._id : t.user,
        bookId: typeof t.book === 'object' ? t.book?._id : t.book,
        status: t.status === 'active' ? 'Issued' : 
                t.status === 'returned' ? 'Returned' : 
                t.status === 'overdue' ? 'Overdue' : t.status
      });

      dispatch({ 
        type: 'SET_DATA', 
        payload: { 
          books: (booksData.data || []).map(mapBook),
          users: (usersData.data || []).map(mapUser),
          transactions: (txData.data || []).map(mapTx),
          auditLogs: auditData.data || [],
          settings: settingsData.data || INITIAL_SETTINGS,
          syllabi: (syllabiData?.data || []).map(s => ({ ...s, id: s._id || s.id })),
          bibliographies: (bibData?.data || []).map(b => ({ ...b, id: b._id || b.id })),
          readingProgress: (progData?.data || []).map(p => ({ ...p, id: p._id || p.id })),
          recommendations: (recData?.data || []).map(r => ({ ...r, id: r._id || r.id })),
          systemStatus: { online: true, dbConnected: healthData.success || healthData.dbConnected }
        } 
      });
    } catch (err) {
      console.error('Fetch Error:', err);
      dispatch({ type: 'UPDATE_STATUS', status: { online: false, dbConnected: false } });
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      const { token, data: user } = response;
      const role = user?.role;
      
      if (!user || !role) throw new Error('Invalid server response: user data missing');

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token, role }));
      dispatch({ type: 'SET_AUTH', user, role });
      addToast(`Welcome back, ${user.name}!`, 'success');
      fetchData();
      return user;
    } catch (err) {
      throw err;
    }
  }, [addToast, fetchData, apiFetch]);

  // Register
  const register = useCallback(async (userData) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      addToast('System Access Initialized. Please login.', 'success');
      return data.success;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [addToast, apiFetch]);


  // Logout
  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => null);
    } catch (e) {}
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem(STORAGE_KEY);
    addToast('Logged out successfully', 'info');
  }, [addToast, apiFetch]);

  // Update Settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const response = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings),
      });
      dispatch({ type: 'UPDATE_SETTINGS', settings: response.data });
      return response.data;
    } catch (err) {
      addToast(`Settings Sync Failed: ${err.message}`, 'error');
      throw err;
    }
  }, [apiFetch, addToast]);

  // calculateFine Helper
  const calculateFine = useCallback((dueDate) => {
    if (!dueDate) return 0;
    const now = new Date();
    const due = new Date(dueDate);
    if (now <= due) return 0;
    
    const diffTime = Math.abs(now - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * (state.settings.finePerDay || 5);
  }, [state.settings.finePerDay]);

  // Computed Helpers
  const getStats = useCallback(() => {
    const books = state.books || [];
    const users = state.users || [];
    const transactions = state.transactions || [];
    const activeIssues = transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue').length;
    const overdueCount = transactions.filter(t => t.status === 'Overdue' || (t.status === 'Issued' && new Date(t.dueDate) < new Date())).length;
    
    return {
      totalBooks: books.length,
      totalUsers: users.length,
      activeIssues,
      overdueCount,
      availableBooks: books.reduce((sum, b) => sum + (b.available || 0), 0),
      onlineStatus: state.systemStatus.online ? 'Optimal' : 'Offline',
      dbStatus: state.systemStatus.dbConnected ? 'Syncing' : 'Local Memory',
      pendingFines: 0 
    };
  }, [state]);

  const value = {
    ...state,
    loading,
    toasts,
    addToast,
    login,
    register,
    logout,
    fetchData,
    updateSettings,
    getStats,
    calculateFine,
    dispatch,
    apiFetch,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
};
