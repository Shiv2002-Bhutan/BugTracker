const ACTIVITIES = [
  {
    id: 1, user: 'DEV 1', action: 'changed status of', target: 'BUG-041',
    detail: 'Open → In Progress', time: '2 min ago',
    icon: '⟳', iconBg: 'bg-violet-500/20', iconColor: 'text-violet-300',
  },
  {
    id: 2, user: 'DEV 2', action: 'commented on', target: 'BUG-038',
    detail: '"Reproduced on v2.3.1 — looks like a race condition in the auth flow."',
    time: '14 min ago', icon: '💬', iconBg: 'bg-cyan-500/20', iconColor: 'text-cyan-300',
    isComment: true,
  },
  {
    id: 3, user: 'DEV 3', action: 'assigned', target: 'BUG-035',
    detail: '→ DEV 4', time: '1 hr ago',
    icon: '👤', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-300',
  },
  {
    id: 4, user: 'DEV 4', action: 'opened', target: 'BUG-044',
    detail: 'Memory leak in WebSocket handler', time: '2 hr ago',
    icon: '+', iconBg: 'bg-rose-500/20', iconColor: 'text-rose-300',
  },
  {
    id: 5, user: 'DEV 5', action: 'resolved', target: 'BUG-030',
    detail: 'Fixed in commit #7a3c8b', time: '3 hr ago',
    icon: '✓', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300',
  },
  {
    id: 6, user: 'DEV 1', action: 'mentioned you in', target: 'BUG-033',
    detail: '"@alex can you verify the fix on staging?"', time: '5 hr ago',
    icon: '@', iconBg: 'bg-indigo-500/20', iconColor: 'text-indigo-300',
    isComment: true,
  },
];

const ActivityFeed = () => (
  <div className="flex flex-col">
    {ACTIVITIES.map((item, idx) => (
      <div
        key={item.id}
        className="activity-item flex gap-3 py-3 relative animate-fade-up"
        style={{ animationDelay: `${idx * 55}ms` }}
      >
        {/* Connector line */}
        {idx < ACTIVITIES.length - 1 && (
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
  </div>
);

export default ActivityFeed;