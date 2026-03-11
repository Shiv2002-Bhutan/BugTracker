import { useEffect, useMemo, useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { apiFetch } from '../../lib/api';

const COLUMNS = [
  { id:'open',     label:'Open' },
  { id:'progress', label:'In Progress' },
  { id:'resolved', label:'Resolved' },
  { id:'closed',   label:'Closed' },
];

const KanbanBoard = () => {
  const [sevFilter, setSevFilter] = useState('all');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiFetch('/api/issues');
        const normalized = Array.isArray(data) ? data : [];
        if (active) {
          setCards(normalized.map(i => ({
            id: i.id,
            title: i.title,
            severity: i.severity,
            status: i.status,
            assignee: i.assignee,
            commentCount: 0
          })));
        }
      } catch (err) {
        if (active) setError('Failed to load issues');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const visible = useMemo(
    () => cards.filter(c => sevFilter === 'all' || c.severity === sevFilter),
    [cards, sevFilter]
  );

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
        {loading ? (
          <div className="col-span-full text-center text-white/30 font-mono text-[11px] py-10">
            Loading board…
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-rose-300/80 font-mono text-[11px] py-10">
            {error}
          </div>
        ) : (
          COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={visible.filter(c => c.status === col.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
