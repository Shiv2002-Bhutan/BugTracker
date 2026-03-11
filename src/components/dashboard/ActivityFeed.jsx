import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

const iconMap = {
  open:    { icon:'+', iconBg:'bg-rose-500/20', iconColor:'text-rose-300' },
  comment: { icon:'💬', iconBg:'bg-cyan-500/20', iconColor:'text-cyan-300', isComment:true },
};

const timeAgo = (dateString) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'just now';
  const diff = Math.max(0, Date.now() - d.getTime());
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
};

const ActivityFeed = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('/api/activity?limit=12')
      .then(data => { if (active) setItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError('Failed to load activity'); });
    return () => { active = false; };
  }, []);

  const mapped = useMemo(() => items.map((item, idx) => {
    const meta = iconMap[item.kind] || iconMap.open;
    return {
      id: `${item.target}-${idx}`,
      user: item.user_name,
      action: item.action,
      target: item.target,
      detail: item.detail,
      time: timeAgo(item.created),
      ...meta
    };
  }), [items]);

  if (error) {
    return <div className="text-[11px] text-rose-300/80">{error}</div>;
  }

  return (
    <div className="flex flex-col">
      {mapped.map((item, idx) => (
      <div
        key={item.id}
        className="activity-item flex gap-3 py-3 relative animate-fade-up"
        style={{ animationDelay: `${idx * 55}ms` }}
      >
        {/* Connector line */}
        {idx < mapped.length - 1 && (
          <div className="absolute left-[14px] top-11 bottom-0 w-px bg-white/[0.05]" />
        )}

        {/* Icon */}
        <div className={`activity-icon-wrap relative shrink-0 w-7 h-7 rounded-full flex items-center
                         justify-center text-xs border border-white/[0.08] z-10
                         ${item.iconBg} ${item.iconColor}`}>
          {item.icon}
        </div>

        {/* Content */}
        <div className="flex-1 pt-0.5 min-w-0">
          <p className="text-[13px] text-white/60 leading-snug">
            <span className="text-white font-semibold">{item.user}</span>{' '}
            {item.action}{' '}
            <span className="font-mono text-[11px] font-semibold text-violet-400">{item.target}</span>
          </p>
          {item.detail && (
            <p className={`text-[11px] mt-0.5 leading-snug ${
              item.isComment ? 'text-white/35 italic' : 'text-white/30'
            }`}>
              {item.detail}
            </p>
          )}
          <p className="text-[10px] font-mono text-white/20 mt-1">{item.time}</p>
        </div>
      </div>
    ))}
      {mapped.length === 0 && (
        <div className="text-[11px] text-white/30 py-6">No recent activity</div>
      )}
    </div>
  );
};

export default ActivityFeed;
