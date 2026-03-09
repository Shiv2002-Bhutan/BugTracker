const COL_COLORS = {
  open:     { dot:'#7c3aed', glow:'rgba(124,58,237,0.5)', accent:'#7c3aed' },
  progress: { dot:'#d97706', glow:'rgba(217,119,6,0.5)',  accent:'#d97706' },
  resolved: { dot:'#059669', glow:'rgba(5,150,105,0.5)', accent:'#059669' },
  closed:   { dot:'rgba(255,255,255,0.25)', glow:'rgba(255,255,255,0.15)', accent:'rgba(255,255,255,0.25)' },
};

const SEV_STYLES = {
  critical: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
  high:     'text-orange-300 bg-orange-500/10 border-orange-500/25',
  medium:   'text-amber-300 bg-amber-500/10 border-amber-500/25',
  low:      'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
};

const AVATAR_PALETTE = ['#7c3aed','#4f46e5','#0891b2','#059669','#d97706'];

/* ── Card ── */
const KanbanCard = ({ card, delay, accentColor }) => {
  const bg = card.assignee
    ? AVATAR_PALETTE[card.assignee.charCodeAt(0) % AVATAR_PALETTE.length]
    : '#374151';
  const initials = card.assignee
    ? card.assignee.split(' ').map(p=>p[0]).join('').slice(0,2)
    : '?';

  return (
    <div
      className="kanban-card animate-fade-up"
      style={{ '--card-accent': accentColor, animationDelay:`${delay}ms` }}
    >
      <p className="font-mono text-[9px] text-white/25 mb-1">{card.id}</p>
      <p className="text-[13px] font-medium text-white leading-snug mb-3">{card.title}</p>

      <div className="flex items-center justify-between gap-2">
        <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border capitalize
                          tracking-wide uppercase ${SEV_STYLES[card.severity]}`}>
          {card.severity}
        </span>

        <div className="flex items-center gap-2">
          {card.commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-white/25">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {card.commentCount}
            </span>
          )}
          <span
            title={card.assignee || 'Unassigned'}
            style={{ width:20, height:20, background:bg, fontSize:8 }}
            className="rounded-full inline-flex items-center justify-center font-bold text-white shrink-0">
            {initials}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Column ── */
const KanbanColumn = ({ column, cards }) => {
  const c = COL_COLORS[column.id] || COL_COLORS.closed;

  return (
    <div className="glass-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold
                        tracking-[0.06em] uppercase text-white/70">
          <span className="w-2 h-2 rounded-full shrink-0"
            style={{ background:c.dot, boxShadow:`0 0 6px ${c.glow}` }}/>
          {column.label}
        </div>
        <span className="text-[10px] font-mono text-white/30 bg-white/[0.04]
                         border border-white/[0.07] px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="p-3 flex flex-col gap-2 flex-1 min-h-[110px]">
        {cards.length === 0 && (
          <div className="flex-1 flex items-center justify-center
                          border border-dashed border-white/[0.07] rounded-xl
                          text-[11px] font-mono text-white/20 py-5">
            No issues
          </div>
        )}
        {cards.map((card, idx) => (
          <KanbanCard key={card.id} card={card} delay={idx*45} accentColor={c.accent}/>
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;