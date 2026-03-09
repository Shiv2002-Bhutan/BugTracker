import { useState } from 'react';
import KanbanColumn from './KanbanColumn';

const COLUMNS = [
  { id:'open',     label:'Open' },
  { id:'progress', label:'In Progress' },
  { id:'resolved', label:'Resolved' },
  { id:'closed',   label:'Closed' },
];

const ALL_CARDS = [
  { id:'BUG-044', title:'Memory leak in WebSocket handler',           severity:'critical', status:'open',     assignee:'DEV 1',   commentCount:3 },
  { id:'BUG-038', title:'Dashboard chart blank on Safari 17',         severity:'medium',   status:'open',     assignee:'DEV 2',  commentCount:5 },
  { id:'BUG-033', title:'Tooltip overflows viewport on mobile',       severity:'low',      status:'open',     assignee:null,         commentCount:1 },
  { id:'BUG-031', title:'Sort order resets after page refresh',       severity:'low',      status:'open',     assignee:null,         commentCount:0 },
  { id:'BUG-043', title:'Login redirect loop on OAuth callback',      severity:'high',     status:'progress', assignee:'DEV 3',   commentCount:7 },
  { id:'BUG-041', title:'Race condition in concurrent file uploads',  severity:'high',     status:'progress', assignee:'DEV 4',    commentCount:4 },
  { id:'BUG-035', title:'CSV export drops timezone offset',           severity:'medium',   status:'progress', assignee:'DEV 5', commentCount:2 },
  { id:'BUG-029', title:'API rate limiter not resetting correctly',   severity:'medium',   status:'progress', assignee:'DEV 6',   commentCount:6 },
  { id:'BUG-030', title:'Email notifications sent twice on retry',    severity:'high',     status:'resolved', assignee:'DEV 7',   commentCount:8 },
  { id:'BUG-028', title:'Search index out of sync after bulk delete', severity:'critical', status:'resolved', assignee:'DEV 8',    commentCount:11 },
  { id:'BUG-027', title:'Incorrect totals in billing summary',        severity:'medium',   status:'resolved', assignee:'DEV 9', commentCount:3 },
  { id:'BUG-025', title:'Session expires silently without feedback',  severity:'medium',   status:'closed',   assignee:'DEV 10',  commentCount:4 },
  { id:'BUG-020', title:'Pagination resets on filter change',         severity:'low',      status:'closed',   assignee:'DEV 11', commentCount:2 },
];

const KanbanBoard = () => {
  const [sevFilter, setSevFilter] = useState('all');

  const visible = ALL_CARDS.filter(c => sevFilter === 'all' || c.severity === sevFilter);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-white/25 mr-1">
          Severity:
        </span>
        {['all','critical','high','medium','low'].map(s => (
          <button key={s} className={`filter-chip ${sevFilter===s?'active':''}`} onClick={()=>setSevFilter(s)}>
            {s==='all' ? 'All' : s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-mono text-white/25">
          {visible.length} issues
        </span>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-4">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            cards={visible.filter(c => c.status === col.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;