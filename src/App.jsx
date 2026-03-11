import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import Kanban from './pages/Kanban';
import Terminal from './components/terminal/Terminal';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { useUI } from './context/UIContext';
import './index.css';
import './styles/global.css';

/* ── Terminal page wrapper ── */
const TerminalPage = () => {
  const { openNewIssue, openConfig } = useUI();
  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-white leading-tight">Terminal</h1>
          <p className="text-[13px] text-white/45 mt-1">Developer CLI interface for BugTrack</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={openConfig}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Configure
          </button>
          <button className="btn btn-primary btn-sm" onClick={openNewIssue}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Issue
          </button>
          <span className="text-[9px] font-mono px-3 py-1.5 rounded-full bg-emerald-500/15
                           text-emerald-400 border border-emerald-500/30 tracking-[0.1em] uppercase">
            ● Connected
          </span>
        </div>
      </div>

      <Terminal/>

      <div className="glass-card mt-5">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <span className="font-display font-bold text-[15px] text-white tracking-tight">Quick Reference</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['bug list',                    'List all open issues'],
            ['bug create',                  'Open a new bug report'],
            ['bug status BUG-041',          "Check a bug's status"],
            ['bug close BUG-044',           'Close a bug'],
            ['bug assign BUG-038 --to DEV 4','Assign to team member'],
            ['bug comment BUG-041 "text"',  'Add a comment'],
            ['whoami',                      'Show current user'],
            ['help',                        'List all commands'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3.5">
              <p className="font-mono text-[10px] text-violet-400 mb-1.5">$ {cmd}</p>
              <p className="text-[11px] text-white/30">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── App ── */
const PAGES = { dashboard: Dashboard, issues: Issues, kanban: Kanban, terminal: TerminalPage };

export default function App() {
  const [page, setPage] = useState('dashboard');
  const Page = PAGES[page] || Dashboard;

  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <Layout currentPage={page} onNavigate={setPage}>
            <Page/>
          </Layout>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
