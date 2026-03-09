import { useState } from 'react';

const ISSUES = [
  { id:'BUG-044', title:'Memory leak in WebSocket handler',           severity:'critical', status:'open',     priority:'P0', assignee:'DEV1',   reporter:'DEV10',   created:'Mar 9, 2026',  tags:['backend','perf'] },
  { id:'BUG-043', title:'Login redirect loop on OAuth callback',      severity:'high',     status:'progress', priority:'P1', assignee:'DEV 2',   reporter:'DEV10',  created:'Mar 8, 2026',  tags:['auth','frontend'] },
  { id:'BUG-041', title:'Race condition in concurrent file uploads',  severity:'high',     status:'progress', priority:'P1', assignee:'DEV 3',    reporter:'DEV 12',    created:'Mar 7, 2026',  tags:['backend','storage'] },
  { id:'BUG-038', title:'Dashboard chart blank on Safari 17',         severity:'medium',   status:'open',     priority:'P2', assignee:'DEV 4',  reporter:'DEV1',    created:'Mar 6, 2026',  tags:['frontend','browser'] },
  { id:'BUG-035', title:'CSV export drops timezone offset',           severity:'medium',   status:'progress', priority:'P2', assignee:'DEV 5', reporter:'DEV10',     created:'Mar 5, 2026',  tags:['export','data'] },
  { id:'BUG-033', title:'Tooltip overflows viewport on mobile',       severity:'low',      status:'open',     priority:'P3', assignee:'DEV 7',         reporter:'DEV10',   created:'Mar 4, 2026',  tags:['mobile','ui'] },
  { id:'BUG-030', title:'Email notifications sent twice on retry',    severity:'high',     status:'resolved', priority:'P1', assignee:'DEV 6',   reporter:'DEV10',    created:'Mar 2, 2026',  tags:['notifications'] },
  { id:'BUG-028', title:'Search index out of sync after bulk delete', severity:'critical', status:'resolved', priority:'P0', assignee:'DEV 8',    reporter:'DEV10',  created:'Feb 28, 2026', tags:['search','data'] },
  { id:'BUG-025', title:'Session expires silently without feedback',  severity:'medium',   status:'closed',   priority:'P2', assignee:'DEV 9',  reporter:'DEV10',    created:'Feb 25, 2026', tags:['auth','ux'] },
  { id:'BUG-020', title:'Pagination resets on filter change',         severity:'low',      status:'closed',   priority:'P3', assignee:'DEV 10', reporter:'DEV10',    created:'Feb 20, 2026', tags:['ui','frontend'] },
];

const SEV_ORDER = { critical:0, high:1, medium:2, low:3 };

/* ─ Badges ─ */
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

const IssuesTable = () => {
  const [search, setSearch]           = useState('');
  const [statusF, setStatusF]         = useState('all');
  const [severityF, setSeverityF]     = useState('all');
  const [sortKey, setSortKey]         = useState('severity');

  const filtered = ISSUES
    .filter(i => {
      if (statusF !== 'all' && i.status !== statusF) return false;
      if (severityF !== 'all' && i.severity !== severityF) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortKey === 'severity' ? SEV_ORDER[a.severity] - SEV_ORDER[b.severity]
                  : sortKey === 'status'   ? a.status.localeCompare(b.status)
                  : b.id.localeCompare(a.id));

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="field pl-8 w-52 text-xs" placeholder="Search issues…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {['all','open','progress','resolved','closed'].map(s => (
            <button key={s} className={`filter-chip ${statusF===s?'active':''}`} onClick={()=>setStatusF(s)}>
              {s==='all'?'All Status':s==='progress'?'In Progress':s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        {/* Severity chips */}
        <div className="flex gap-1.5 flex-wrap">
          {['all','critical','high','medium','low'].map(s => (
            <button key={s} className={`filter-chip ${severityF===s?'active':''}`} onClick={()=>setSeverityF(s)}>
              {s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-mono text-white/25">Sort:</span>
          <select className="field select w-32 text-xs" value={sortKey} onChange={e=>setSortKey(e.target.value)}>
            <option value="severity">Severity</option>
            <option value="status">Status</option>
            <option value="id">ID (newest)</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID','Title','Severity','Status','Priority','Assignee','Tags','Created'].map(h => (
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
                  <td colSpan={8}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] flex-wrap gap-2">
          <span className="text-[11px] font-mono text-white/25">
            {filtered.length} of {ISSUES.length} issues
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
    </div>
  );
};

export default IssuesTable;