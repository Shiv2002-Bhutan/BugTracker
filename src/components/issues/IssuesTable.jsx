import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const SEV_ORDER = { critical:0, high:1, medium:2, low:3 };

const StatusBadge = ({ status }) => {
  const map = { open:['badge-open','Open'], progress:['badge-progress','In Progress'], resolved:['badge-resolved','Resolved'], closed:['badge-closed','Closed'] };
  const [cls, lbl] = map[status] || ['badge-closed', status];
  return <span className={`badge ${cls}`}>{lbl}</span>;
};
const SevBadge = ({ severity }) => {
  const map = { critical:['badge-critical','⬤ Critical'], high:['badge-high','⬤ High'], medium:['badge-medium','⬤ Medium'], low:['badge-low','⬤ Low'] };
  const [cls, lbl] = map[severity] || ['badge-low', severity];
  return <span className={`badge ${cls}`}>{lbl}</span>;
};

const PRIO_COLORS = { P0:'text-rose-300 bg-rose-500/10 border-rose-500/25', P1:'text-orange-300 bg-orange-500/10 border-orange-500/25', P2:'text-amber-300 bg-amber-500/10 border-amber-500/25', P3:'text-white/30 bg-white/5 border-white/10' };

const AVATAR_PALETTE = ['#7c3aed','#4f46e5','#0891b2','#059669','#d97706'];
const Avatar = ({ name, size=22 }) => {
  if (!name) return <span className="text-white/20 text-xs">—</span>;
  const initials = name.split(' ').map(p=>p[0]).join('').slice(0,2);
  const bg = AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
  return (
    <span style={{ width:size, height:size, background:bg, fontSize:size*0.38 }}
      className="rounded-full inline-flex items-center justify-center font-bold text-white shrink-0">
      {initials}
    </span>
  );
};

const IssuesTable = ({ refreshKey = 0 }) => {
  const { token } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [users, setUsers] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editIssue, setEditIssue] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    severity: '',
    status: '',
    priority: '',
    assigneeId: '',
    tags: ''
  });
  const [reloadTick, setReloadTick] = useState(0);

  const [search, setSearch]           = useState('');
  const [statusF, setStatusF]         = useState('all');
  const [severityF, setSeverityF]     = useState('all');
  const [sortKey, setSortKey]         = useState('severity');

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const data = await apiFetch('/api/issues', { signal: controller.signal });
        const normalized = Array.isArray(data) ? data : [];
        setIssues(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setLoadError('Failed to load issues');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [refreshKey, reloadTick]);

  useEffect(() => {
    if (!token) {
      setUsers([]);
      return;
    }
    apiFetch('/api/users', { token })
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, [token]);

  const formattedIssues = useMemo(() => issues.map(issue => {
    const createdDate = issue.created ? new Date(issue.created) : null;
    const created = createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
      : '—';

    return {
      ...issue,
      title: issue.title ?? '',
      id: issue.id ?? '',
      status: issue.status ? String(issue.status).toLowerCase() : '',
      severity: issue.severity ? String(issue.severity).toLowerCase() : '',
      tags: Array.isArray(issue.tags) ? issue.tags : [],
      created
    };
  }), [issues]);

  const filtered = formattedIssues
    .filter(i => {
      if (statusF !== 'all' && i.status !== statusF) return false;
      if (severityF !== 'all' && i.severity !== severityF) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!String(i.title).toLowerCase().includes(q) && !String(i.id).toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => sortKey === 'severity' ? SEV_ORDER[a.severity] - SEV_ORDER[b.severity]
                  : sortKey === 'status'   ? a.status.localeCompare(b.status)
                  : b.id.localeCompare(a.id));

  return (
    <div>
      {actionError && (
        <div className="mb-3 text-[11px] text-rose-300/80 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {actionError}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="field pl-8 w-52 text-xs" placeholder="Search issues…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {['all','open','progress','resolved','closed'].map(s => (
            <button key={s} className={`filter-chip ${statusF===s?'active':''}`} onClick={()=>setStatusF(s)}>
              {s==='all'?'All Status':s==='progress'?'In Progress':s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {['all','critical','high','medium','low'].map(s => (
            <button key={s} className={`filter-chip ${severityF===s?'active':''}`} onClick={()=>setSeverityF(s)}>
              {s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-mono text-white/25">Sort:</span>
          <select className="field select w-32 text-xs" value={sortKey} onChange={e=>setSortKey(e.target.value)}>
            <option value="severity">Severity</option>
            <option value="status">Status</option>
            <option value="id">ID (newest)</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <p className="font-display font-bold text-white/30 mb-1">Loading issues…</p>
              <p className="text-xs text-white/20">Fetching from the API</p>
            </div>
          ) : loadError ? (
            <div className="py-16 text-center">
              <p className="font-display font-bold text-white/30 mb-1">{loadError}</p>
              <p className="text-xs text-white/20">Check the backend server</p>
            </div>
          ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID','Title','Severity','Status','Priority','Assignee','Tags','Created','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] font-mono font-semibold
                                         tracking-[0.1em] uppercase text-white/25
                                         border-b border-white/[0.06] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="py-16 text-center">
                      <p className="text-3xl opacity-30 mb-3">🔍</p>
                      <p className="font-display font-bold text-white/30 mb-1">No issues found</p>
                      <p className="text-xs text-white/20">Adjust filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((issue, idx) => (
                <tr key={issue.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer
                             transition-colors duration-100 animate-fade-up"
                  style={{ animationDelay:`${idx*35}ms` }}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] font-semibold text-violet-400">{issue.id}</span>
                  </td>
                  <td className="px-4 py-3 min-w-[220px]">
                    <span className="text-[13px] font-medium text-white">{issue.title}</span>
                  </td>
                  <td className="px-4 py-3"><SevBadge severity={issue.severity}/></td>
                  <td className="px-4 py-3"><StatusBadge status={issue.status}/></td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded
                                      border ${PRIO_COLORS[issue.priority]}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={issue.assignee} size={22}/>
                      <span className="text-[12px] text-white/50">{issue.assignee || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {issue.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-mono text-white/25 bg-white/[0.04]
                                                   border border-white/[0.07] px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-white/25 whitespace-nowrap">
                    {issue.created}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={!token}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!token) return;
                          try {
                            setBusyId(issue.id);
                            setActionError('');
                            const data = await apiFetch(`/api/issues/${issue.id}`, { token });
                            setEditIssue(data);
                            setEditForm({
                              title: data.title || '',
                              description: data.description || '',
                              severity: data.severity || '',
                              status: data.status || '',
                              priority: data.priority || '',
                              assigneeId: '',
                              tags: Array.isArray(data.tags) ? data.tags.join(', ') : ''
                            });
                            setEditOpen(true);
                          } catch (err) {
                            setActionError(err.message || 'Failed to load issue');
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={!token}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!token) return;
                          try {
                            setBusyId(issue.id);
                            setActionError('');
                            const nextStatus = issue.status === 'closed' ? 'open' : 'closed';
                            await apiFetch(`/api/issues/${issue.id}`, {
                              method: 'PATCH',
                              token,
                              body: JSON.stringify({ status: nextStatus })
                            });
                            setReloadTick(t => t + 1);
                          } catch (err) {
                            setActionError(err.message || 'Failed to update status');
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        {issue.status === 'closed' ? 'Reopen' : 'Close'}
                      </button>
                      <select
                        className="field select w-28 text-[10px]"
                        disabled={!token || users.length === 0}
                        value=""
                        onChange={async (e) => {
                          e.stopPropagation();
                          if (!token) return;
                          const value = e.target.value;
                          if (!value) return;
                          try {
                            setBusyId(issue.id);
                            setActionError('');
                            await apiFetch(`/api/issues/${issue.id}`, {
                              method: 'PATCH',
                              token,
                              body: JSON.stringify({ assigneeId: Number(value) })
                            });
                            setReloadTick(t => t + 1);
                          } catch (err) {
                            setActionError(err.message || 'Failed to assign');
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        <option value="">Assign</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.username}</option>
                        ))}
                      </select>
                      {busyId === issue.id && (
                        <span className="text-[10px] text-white/30 font-mono">…</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] flex-wrap gap-2">
          <span className="text-[11px] font-mono text-white/25">
            {filtered.length} of {formattedIssues.length} issues
          </span>
          <div className="flex gap-1">
            {[1,2,3].map(p => (
              <button key={p}
                className={`w-7 h-7 rounded-lg text-xs font-mono border transition-colors
                  ${p===1
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/30 hover:bg-white/[0.07]'
                  }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {editOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center
                     justify-center p-4 animate-fade-up"
          onClick={e => { if (e.target === e.currentTarget) setEditOpen(false); }}
        >
          <div className="glass-card w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <span className="font-display font-bold text-[15px] text-white tracking-tight">
                Edit Issue {editIssue?.id || ''}
              </span>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditOpen(false)}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                  Title
                </label>
                <input
                  className="field"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                  Description
                </label>
                <textarea
                  className="field resize-y"
                  rows={4}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                    Severity
                  </label>
                  <select
                    className="field select"
                    value={editForm.severity}
                    onChange={e => setEditForm({ ...editForm, severity: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                    Status
                  </label>
                  <select
                    className="field select"
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="open">Open</option>
                    <option value="progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                    Priority
                  </label>
                  <select
                    className="field select"
                    value={editForm.priority}
                    onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                    Assignee
                  </label>
                  <select
                    className="field select"
                    value={editForm.assigneeId}
                    onChange={e => setEditForm({ ...editForm, assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/30 mb-1.5">
                  Tags
                </label>
                <input
                  className="field"
                  value={editForm.tags}
                  onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (!editIssue) return;
                    try {
                      setBusyId(editIssue.id);
                      setActionError('');
                      const tags = editForm.tags
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean);
                      await apiFetch(`/api/issues/${editIssue.id}`, {
                        method: 'PATCH',
                        token,
                        body: JSON.stringify({
                          title: editForm.title,
                          description: editForm.description,
                          severity: editForm.severity || undefined,
                          status: editForm.status || undefined,
                          priority: editForm.priority || undefined,
                          assigneeId: editForm.assigneeId ? Number(editForm.assigneeId) : null,
                          tags
                        })
                      });
                      setEditOpen(false);
                      setReloadTick(t => t + 1);
                    } catch (err) {
                      setActionError(err.message || 'Failed to update issue');
                    } finally {
                      setBusyId(null);
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesTable;
