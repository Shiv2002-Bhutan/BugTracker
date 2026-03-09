const COLOR_MAP = {
  violet:  { value: 'text-violet-400',  orb: '#7c3aed' },
  amber:   { value: 'text-amber-400',   orb: '#d97706' },
  emerald: { value: 'text-emerald-400', orb: '#059669' },
  rose:    { value: 'text-rose-400',    orb: '#e11d48' },
  cyan:    { value: 'text-cyan-400',    orb: '#0891b2' },
};

const StatsCard = ({ label, value, delta, deltaType = 'neutral', icon, color = 'violet' }) => {
  const { value: valueClass, orb } = COLOR_MAP[color] || COLOR_MAP.violet;

  const deltaClass = {
    up:      'text-emerald-400',
    down:    'text-rose-400',
    neutral: 'text-white/30',
  }[deltaType];

  const deltaArrow = { up: '↑', down: '↓', neutral: '—' }[deltaType];

  return (
    <div
      className="glass-card stat-orb p-5 relative overflow-hidden animate-fade-up"
      style={{ '--orb-color': orb }}
    >
      <p className="text-[9px] font-mono font-semibold tracking-[0.12em] uppercase text-white/30 mb-2">
        {label}
      </p>

      <p className={`font-display text-[38px] font-extrabold leading-none tracking-tight mb-2 ${valueClass}`}>
        {value}
      </p>

      {delta && (
        <p className={`flex items-center gap-1 text-[11px] font-mono font-medium ${deltaClass}`}>
          <span>{deltaArrow}</span>
          <span>{delta}</span>
        </p>
      )}

      {icon && (
        <span className="absolute top-4 right-5 text-xl opacity-20 select-none">
          {icon}
        </span>
      )}
    </div>
  );
};

export default StatsCard;