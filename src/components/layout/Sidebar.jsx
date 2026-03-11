import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { apiFetch } from '../../lib/api';

/* ── Icons ─────────────────────────────────────────────── */
const Icon = ({ children, className = '' }) => (
  <svg className={`w-4 h-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const DashIcon  = () => <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
const BugIcon   = () => <Icon><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/></Icon>;
const BoardIcon = () => <Icon><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="13" rx="1"/><rect x="17" y="3" width="5" height="9" rx="1"/></Icon>;
const TermIcon  = () => <Icon><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></Icon>;
const TeamIcon  = () => <Icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const CogIcon   = () => <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;

const Dot = ({ color }) => (
  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
);

/* ── NavItem ────────────────────────────────────────────── */
const NavItem = ({ icon, label, badge, active, onClick }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span className={`opacity-60 ${active ? '!opacity-100' : ''}`}>{icon}</span>
    <span className="flex-1">{label}</span>
    {badge !== undefined && (
      <span className="ml-auto text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full
                       bg-violet-500/20 text-violet-300 border border-violet-500/30">
        {badge}
      </span>
    )}
  </div>
);

/* ── Sidebar ────────────────────────────────────────────── */
const Sidebar = ({ currentPage, onNavigate }) => {
  const { sidebarOpen, setSidebarOpen } = useTheme();
  const close = () => setSidebarOpen(false);
  const { user, login, register, logout } = useAuth();
  const { issueRefreshKey } = useUI();
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, critical: 0 });
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ identifier: '', password: '', username: '', email: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch('/api/stats')
      .then(data => {
        if (!active) return;
        setStats({
          open: data.open ?? 0,
          inProgress: data.inProgress ?? 0,
          resolved: data.resolved ?? 0,
          critical: data.critical ?? 0
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [issueRefreshKey]);

  const submitAuth = async () => {
    setSaving(true);
    setError('');
    try {
      if (mode === 'login') {
        await login({ identifier: form.identifier, password: form.password });
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
      }
      setAuthOpen(false);
      setForm({ identifier: '', password: '', username: '', email: '' });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        glass-panel fixed left-0 top-0 bottom-0 w-[240px]
        flex flex-col py-5 z-[100]
        transition-transform duration-250
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pb-5 border-b border-white/[0.07] mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
                          flex items-center justify-center text-white text-sm font-display font-extrabold
                          shadow-glow-violet shrink-0">
            B
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight text-white">BugTracker</span>
         
        </div>

        {/* Workspace section */}
        <div className="px-3 mb-4">
          <p className="text-[9px] font-mono font-semibold tracking-[0.12em] uppercase text-white/25 px-3 mb-1.5">
            Workspace
          </p>
          <NavItem icon={<DashIcon/>}  label="Dashboard"    active={currentPage==='dashboard'} onClick={()=>{onNavigate('dashboard');close();}} />
          <NavItem icon={<BugIcon/>}   label="Issues"       badge={stats.open} active={currentPage==='issues'}    onClick={()=>{onNavigate('issues');close();}} />
          <NavItem icon={<BoardIcon/>} label="Kanban Board" active={currentPage==='kanban'}    onClick={()=>{onNavigate('kanban');close();}} />
          <NavItem icon={<TermIcon/>}  label="Terminal"     active={currentPage==='terminal'}  onClick={()=>{onNavigate('terminal');close();}} />
        </div>

        {/* Filters section */}
        <div className="px-3 mb-4">
          <p className="text-[9px] font-mono font-semibold tracking-[0.12em] uppercase text-white/25 px-3 mb-1.5">
            Filters
          </p>
          <NavItem icon={<Dot color="#e11d48"/>} label="Critical" badge={stats.critical}  onClick={()=>{onNavigate('issues');close();}} />
          <NavItem icon={<Dot color="#d97706"/>} label="In Progress" badge={stats.inProgress} onClick={()=>{onNavigate('kanban');close();}} />
          <NavItem icon={<Dot color="#059669"/>} label="Resolved"  badge={stats.resolved} onClick={()=>{onNavigate('issues');close();}} />
        </div>

        {/* Team */}
        <div className="px-3 mb-4">
          <p className="text-[9px] font-mono font-semibold tracking-[0.12em] uppercase text-white/25 px-3 mb-1.5">
            Team
          </p>
          <NavItem icon={<TeamIcon/>} label="Members"  onClick={()=>{}} />
          <NavItem icon={<CogIcon/>}  label="Settings" onClick={()=>{}} />
        </div>

        {/* Footer / User */}
        <div className="mt-auto pt-4 px-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer
                          hover:bg-white/[0.05] transition-colors duration-150"
               onClick={() => setAuthOpen(true)}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500
                            flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user?.username ? user.username.slice(0,2).toUpperCase() : 'AN'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white leading-tight truncate">
                {user?.username || 'Anonymous'}
              </p>
              <p className="text-[10px] font-mono text-white/30">
                {user ? 'Authenticated' : 'Sign in to create'}
              </p>
            </div>
            <span className="text-white/20 text-xs">⌘</span>
          </div>
        </div>
      </aside>

      {authOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center
                     justify-center p-4 animate-fade-up"
          onClick={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}
        >
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <span className="font-display font-bold text-[15px] text-white tracking-tight">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </span>
              <button className="btn btn-ghost btn-icon" onClick={() => setAuthOpen(false)}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {error && (
                <div className="text-[11px] text-rose-300/80 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                      Username
                    </label>
                    <input
                      className="field"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      placeholder="dev01"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                      Email
                    </label>
                    <input
                      className="field"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="dev01@company.com"
                    />
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div>
                  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                    Email or Username
                  </label>
                  <input
                    className="field"
                    value={form.identifier}
                    onChange={e => setForm({ ...form, identifier: e.target.value })}
                    placeholder="dev01 or dev01@company.com"
                  />
                </div>
              )}
              <div>
                <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                  Password
                </label>
                <input
                  className="field"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="btn btn-ghost text-[11px]"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                >
                  {mode === 'login' ? 'Create account' : 'Use existing login'}
                </button>
                {user && (
                  <button className="btn btn-ghost text-[11px]" onClick={logout}>
                    Sign out
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button className="btn btn-ghost" onClick={() => setAuthOpen(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving} onClick={submitAuth}>
                  {saving ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
