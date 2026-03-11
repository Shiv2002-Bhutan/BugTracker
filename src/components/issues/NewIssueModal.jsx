import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const FormLabel = ({ children }) => (
  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase
                     text-white/30 mb-1.5">
    {children}
  </label>
);

const NewIssueModal = () => {
  const { token } = useAuth();
  const { newIssueOpen, closeNewIssue, bumpIssueRefresh } = useUI();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: '',
    priority: '',
    assigneeId: '',
    tags: ''
  });

  useEffect(() => {
    if (!newIssueOpen || !token) return;
    let active = true;
    apiFetch('/api/users', { token })
      .then(data => { if (active) setUsers(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setUsers([]); });
    return () => { active = false; };
  }, [newIssueOpen, token]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      severity: '',
      priority: '',
      assigneeId: '',
      tags: ''
    });
    setError('');
  };

  const canCreate = useMemo(() => Boolean(token), [token]);

  const onCreate = async () => {
    if (!token) {
      setError('Please sign in to create issues.');
      return;
    }
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      await apiFetch('/api/issues', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description?.trim() || null,
          severity: form.severity || undefined,
          priority: form.priority || undefined,
          assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
          tags
        })
      });
      closeNewIssue();
      resetForm();
      bumpIssueRefresh();
    } catch (err) {
      setError(err.message || 'Failed to create issue.');
    } finally {
      setSaving(false);
    }
  };

  if (!newIssueOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center
                 justify-center p-4 animate-fade-up"
      onClick={e => { if (e.target === e.currentTarget) closeNewIssue(); }}
    >
      <div className="glass-card w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <span className="font-display font-bold text-[15px] text-white tracking-tight">
            Create New Issue
          </span>
          <button className="btn btn-ghost btn-icon" onClick={closeNewIssue}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {!canCreate && (
            <div className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              Sign in to create issues.
            </div>
          )}
          {error && (
            <div className="text-[11px] text-rose-300/80 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <FormLabel>Title *</FormLabel>
            <input
              className="field"
              placeholder="Brief description of the bug…"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <FormLabel>Description</FormLabel>
            <textarea
              className="field resize-y"
              rows={4}
              placeholder="Steps to reproduce, expected vs actual behavior…"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel>Severity</FormLabel>
              <select
                className="field select"
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="critical">Critical</option><option value="high">High</option>
                <option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div>
              <FormLabel>Priority</FormLabel>
              <select
                className="field select"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="P0">P0 — Blocker</option>
                <option value="P1">P1 — Critical</option>
                <option value="P2">P2 — Major</option>
                <option value="P3">P3 — Minor</option>
              </select>
            </div>
          </div>
          <div>
            <FormLabel>Assignee</FormLabel>
            <select
              className="field select"
              value={form.assigneeId}
              onChange={e => setForm({ ...form, assigneeId: e.target.value })}
              disabled={!token}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel>Tags</FormLabel>
            <input
              className="field"
              placeholder="backend, ui, perf"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn btn-ghost" onClick={closeNewIssue}>Cancel</button>
            <button className="btn btn-primary" disabled={!canCreate || saving} onClick={onCreate}>
              {saving ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewIssueModal;
