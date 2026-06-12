import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ── Inline styles / CSS ────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Inter', sans-serif;
    background: #0a0f1e;
    color: #e2e8f0;
    min-height: 100vh;
  }

  :root {
    --bg-primary: #0a0f1e;
    --bg-card: #111827;
    --bg-input: #1a2235;
    --border: #1e2d4a;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --accent-glow: rgba(59,130,246,0.15);
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --text-primary: #f1f5f9;
    --text-muted: #64748b;
    --text-secondary: #94a3b8;
    --radius: 12px;
    --radius-sm: 8px;
  }

  .app { display: flex; min-height: 100vh; }
  
  /* Sidebar */
  .sidebar {
    width: 240px;
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 100;
  }
  .sidebar-logo {
    padding: 24px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .logo-text { font-size: 16px; font-weight: 700; color: var(--text-primary); }
  .logo-sub { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono'; }
  
  .sidebar-nav { flex: 1; padding: 16px 12px; }
  .nav-section { font-size: 10px; font-weight: 600; color: var(--text-muted); 
    text-transform: uppercase; letter-spacing: 0.1em; padding: 8px 8px 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--radius-sm);
    cursor: pointer; color: var(--text-secondary);
    font-size: 14px; font-weight: 500;
    transition: all 0.15s;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--accent-glow); color: var(--text-primary); }
  .nav-item.active { background: var(--accent-glow); color: var(--accent); }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }
  
  .sidebar-user {
    padding: 16px; border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
  }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600; color: white;
    flex-shrink: 0;
  }
  .user-info { flex: 1; overflow: hidden; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); 
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--text-muted); }
  .logout-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); font-size: 16px; padding: 4px;
    transition: color 0.15s;
  }
  .logout-btn:hover { color: var(--danger); }

  /* Main content */
  .main { margin-left: 240px; flex: 1; }
  .page { padding: 32px; max-width: 1100px; }
  
  .page-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }
  .page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }
  .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
  
  /* Cards */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }
  
  /* Stat cards */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-bottom: 8px; }
  .stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); }
  .stat-icon { font-size: 20px; float: right; }
  
  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 500; cursor: pointer;
    border: none; transition: all 0.15s; text-decoration: none;
  }
  .btn-primary {
    background: var(--accent); color: white;
  }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-ghost {
    background: transparent; color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { background: var(--bg-input); color: var(--text-primary); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-danger:hover { opacity: 0.9; }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* Form elements */
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; 
    color: var(--text-secondary); margin-bottom: 8px; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 10px 14px;
    background: var(--bg-input); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-size: 14px; font-family: inherit;
    transition: border-color 0.15s;
    outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select option { background: var(--bg-card); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-error { font-size: 12px; color: var(--danger); margin-top: 4px; }
  
  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    text-align: left; padding: 12px 16px;
    font-size: 12px; font-weight: 600; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  td { padding: 14px 16px; font-size: 14px; color: var(--text-secondary); }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  tbody tr:hover { background: var(--accent-glow); }
  tbody tr:last-child { border-bottom: none; }
  
  /* Badges */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 500;
  }
  .badge-todo { background: rgba(100,116,139,0.2); color: #94a3b8; }
  .badge-progress { background: rgba(59,130,246,0.2); color: #60a5fa; }
  .badge-done { background: rgba(16,185,129,0.2); color: #34d399; }
  .badge-low { background: rgba(16,185,129,0.15); color: #34d399; }
  .badge-medium { background: rgba(245,158,11,0.15); color: #fbbf24; }
  .badge-high { background: rgba(239,68,68,0.15); color: #f87171; }
  .badge-user { background: rgba(59,130,246,0.15); color: #60a5fa; }
  .badge-admin { background: rgba(139,92,246,0.15); color: #a78bfa; }
  
  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .modal-title { font-size: 18px; font-weight: 600; color: var(--text-primary); }
  .modal-close {
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); font-size: 20px;
  }
  .modal-close:hover { color: var(--text-primary); }
  
  /* Auth pages */
  .auth-page {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-primary);
    padding: 20px;
  }
  .auth-card {
    width: 100%; max-width: 420px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 40px;
  }
  .auth-logo {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 32px; justify-content: center;
  }
  .auth-logo-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .auth-title { font-size: 22px; font-weight: 700; color: var(--text-primary); text-align: center; }
  .auth-subtitle { font-size: 14px; color: var(--text-muted); text-align: center; margin-bottom: 28px; }
  .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text-muted); }
  .auth-switch a { color: var(--accent); cursor: pointer; font-weight: 500; }
  .auth-switch a:hover { text-decoration: underline; }
  
  /* Toast */
  .toast-container {
    position: fixed; top: 20px; right: 20px;
    z-index: 999; display: flex; flex-direction: column; gap: 10px;
  }
  .toast {
    display: flex; align-items: center; gap: 12px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 14px 18px;
    min-width: 280px; max-width: 360px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .toast-success { border-left: 3px solid var(--success); }
  .toast-error { border-left: 3px solid var(--danger); }
  .toast-text { font-size: 14px; color: var(--text-primary); }
  
  /* Pagination */
  .pagination {
    display: flex; align-items: center; gap: 8px;
    justify-content: flex-end; margin-top: 20px;
  }
  .page-btn {
    padding: 6px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: transparent;
    color: var(--text-secondary); cursor: pointer; font-size: 13px;
    transition: all 0.15s;
  }
  .page-btn:hover { background: var(--bg-input); color: var(--text-primary); }
  .page-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  
  /* Filter bar */
  .filter-bar {
    display: flex; gap: 12px; align-items: center;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .filter-bar .form-select { width: auto; min-width: 130px; }
  .filter-bar .form-input { width: auto; min-width: 200px; }
  
  .empty-state {
    text-align: center; padding: 60px 20px;
    color: var(--text-muted);
  }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
  
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .divider { 
    border: none; border-top: 1px solid var(--border);
    margin: 24px 0;
  }

  .role-badge-admin { background: rgba(139,92,246,0.15); color: #a78bfa; }
`;

// ── Toast System ───────────────────────────────────────────────────────────
const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  return (
    <ToastContext.Provider value={{ success: m => add(m, 'success'), error: m => add(m, 'error') }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✓' : '✕'}</span>
            <span className="toast-text">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => useContext(ToastContext);

// ── Auth Context ───────────────────────────────────────────────────────────
const AuthContext = createContext(null);

const API = 'http://localhost:5000/api/v1';

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    apiFetch('/auth/me')
      .then(d => setUser(d.data))
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (creds) => {
    const d = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(creds) });
    localStorage.setItem('accessToken', d.data.accessToken);
    localStorage.setItem('refreshToken', d.data.refreshToken);
    setUser(d.data.user);
    return d;
  };

  const register = async (userData) => {
    const d = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    localStorage.setItem('accessToken', d.data.accessToken);
    localStorage.setItem('refreshToken', d.data.refreshToken);
    setUser(d.data.user);
    return d;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } catch {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ── Login Page ─────────────────────────────────────────────────────────────
const LoginPage = ({ onSwitch }) => {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>PrimeTrade</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Task Manager API</div>
          </div>
        </div>
        <p className="auth-title">Welcome back</p>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({}); }} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({}); }} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <a onClick={onSwitch}>Register</a>
        </div>
        
        <hr className="divider" />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Demo credentials:</strong><br />
          Admin: admin@demo.com / Admin123<br />
          User: user@demo.com / User1234
        </div>
      </div>
    </div>
  );
};

// ── Register Page ──────────────────────────────────────────────────────────
const RegisterPage = ({ onSwitch }) => {
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Must contain uppercase, lowercase, and number';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => { setForm({ ...form, [k]: v }); setErrors({}); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>PrimeTrade</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Task Manager API</div>
          </div>
        </div>
        <p className="auth-title">Create account</p>
        <p className="auth-subtitle">Join the platform today</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 8 chars, uppercase + number" value={form.password} onChange={e => set('password', e.target.value)} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create account'}
          </button>
        </form>
        <div className="auth-switch">Already have an account? <a onClick={onSwitch}>Sign in</a></div>
      </div>
    </div>
  );
};

// ── Task Modal ─────────────────────────────────────────────────────────────
const TaskModal = ({ task, onClose, onSave }) => {
  const toast = useToast();
  const [form, setForm] = useState(task || { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const path = task ? `/tasks/${task.id}` : '/tasks';
      const method = task ? 'PATCH' : 'POST';
      await apiFetch(path, { method, body: JSON.stringify(payload) });
      toast.success(task ? 'Task updated!' : 'Task created!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => { setForm({ ...form, [k]: v }); setErrors({}); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="What needs to be done?" value={form.title} onChange={e => set('title', e.target.value)} />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Optional description..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input className="form-input" placeholder="api, backend, urgent" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Status / Priority helpers ──────────────────────────────────────────────
const StatusBadge = ({ s }) => {
  const map = { todo: ['badge-todo', 'To Do'], in_progress: ['badge-progress', 'In Progress'], done: ['badge-done', 'Done'] };
  const [cls, label] = map[s] || ['badge-todo', s];
  return <span className={`badge ${cls}`}>{label}</span>;
};
const PriorityBadge = ({ p }) => {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
  return <span className={`badge ${map[p] || ''}`}>{p}</span>;
};

// ── Tasks Page ─────────────────────────────────────────────────────────────
const TasksPage = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | task object
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 10, search: '' });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const d = await apiFetch(`/tasks?${params}`);
      setTasks(d.data);
      setMeta(d.meta || {});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{isAdmin ? 'All tasks across the platform' : 'Your personal task board'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>＋ New Task</button>
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="🔍 Search tasks..." value={filters.search}
          onChange={e => setFilter('search', e.target.value)} style={{ minWidth: 220 }} />
        <select className="form-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-select" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', priority: '', page: 1, limit: 10, search: '' })}>
          Reset
        </button>
        {meta.total !== undefined && <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 'auto' }}>{meta.total} tasks</span>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No tasks found</div>
            <p>Create your first task to get started</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  {isAdmin && <th>Owner</th>}
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</div>}
                      {task.tags?.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                          {task.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 6px', background: 'var(--bg-input)', borderRadius: 4, color: 'var(--text-muted)' }}>{t}</span>)}
                        </div>
                      )}
                    </td>
                    <td><StatusBadge s={task.status} /></td>
                    <td><PriorityBadge p={task.priority} /></td>
                    {isAdmin && <td style={{ fontSize: 13 }}>{task.owner?.name || '—'}</td>}
                    <td style={{ fontSize: 13 }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>‹ Prev</button>
          {Array.from({ length: meta.pages }, (_, i) => i + 1).slice(Math.max(0, filters.page - 3), filters.page + 2).map(p => (
            <button key={p} className={`page-btn ${p === filters.page ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, page: p }))}>{p}</button>
          ))}
          <button className="page-btn" disabled={filters.page >= meta.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next ›</button>
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={fetchTasks}
        />
      )}
    </div>
  );
};

// ── Dashboard Page ─────────────────────────────────────────────────────────
const DashboardPage = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    apiFetch('/tasks?limit=5&sortBy=createdAt&order=desc')
      .then(d => setRecentTasks(d.data))
      .catch(() => {});
    
    if (isAdmin) {
      apiFetch('/tasks/stats')
        .then(d => setStats(d.data))
        .catch(() => {});
    }
  }, [isAdmin]);

  const getStatCount = (arr, key, val) => (arr?.find(s => s._id === val)?.[key]) || 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
          {user?.role}
        </span>
      </div>

      {isAdmin && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="stat-value">{stats.statusStats?.reduce((s, x) => s + x.count, 0) || 0}</div>
              <span style={{ fontSize: 24 }}>📋</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">To Do</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="stat-value" style={{ color: '#94a3b8' }}>{getStatCount(stats.statusStats, 'count', 'todo')}</div>
              <span style={{ fontSize: 24 }}>⏳</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="stat-value" style={{ color: '#60a5fa' }}>{getStatCount(stats.statusStats, 'count', 'in_progress')}</div>
              <span style={{ fontSize: 24 }}>🔄</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="stat-value" style={{ color: '#34d399' }}>{getStatCount(stats.statusStats, 'count', 'done')}</div>
              <span style={{ fontSize: 24 }}>✅</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tasks')}>View all →</button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📝</div>
              <div className="empty-title">No tasks yet</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => onNavigate('tasks')}>Create your first task</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge s={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Name', user?.name], ['Email', user?.email], ['Role', user?.role], ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—']].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {label === 'Role' ? <span className={`badge ${value === 'admin' ? 'badge-admin' : 'badge-user'}`}>{value}</span> : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Users Page (Admin) ─────────────────────────────────────────────────────
const UsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const d = await apiFetch('/auth/users');
      setUsers(d.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await apiFetch(`/auth/users/${user.id}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all registered users</p>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{users.length} total users</span>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{user.role}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-done">Active</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(user)}>
                        {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ page, onNavigate }) => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
    { id: 'tasks', icon: '📋', label: 'Tasks' },
    ...(isAdmin ? [{ id: 'users', icon: '👥', label: 'Users' }] : []),
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <div>
          <div className="logo-text">PrimeTrade</div>
          <div className="logo-sub">API v1.0</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </div>
        ))}

        {isAdmin && (
          <>
            <div className="nav-section" style={{ marginTop: 16 }}>Admin</div>
            <div className="nav-item" onClick={() => window.open('http://localhost:5000/api/docs', '_blank')}>
              <span className="icon">📚</span>
              API Docs
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
      </div>
    </div>
  );
};

// ── Main App ───────────────────────────────────────────────────────────────
const AppContent = () => {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  const [page, setPage] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: 'var(--accent)', margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading PrimeTrade...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return authPage === 'login'
      ? <LoginPage onSwitch={() => setAuthPage('register')} />
      : <RegisterPage onSwitch={() => setAuthPage('login')} />;
  }

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} />
      <div className="main">
        {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
        {page === 'tasks' && <TasksPage />}
        {page === 'users' && <UsersPage />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </>
  );
}
