import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import IssueTrendChart from '../components/dashboard/IssueTrendChart';

const CRITICAL = [
  { id:'BUG-044', title:'Memory leak in WebSocket handler',          sev:'critical', badge:'badge-critical' },
  { id:'BUG-043', title:'Login redirect loop on OAuth callback',     sev:'high',     badge:'badge-high'     },
  { id:'BUG-041', title:'Race condition in concurrent file uploads', sev:'high',     badge:'badge-high'     },
  { id:'BUG-038', title:'Dashboard chart blank on Safari 17',        sev:'medium',   badge:'badge-medium'   },
];

const Dashboard = () => (
  <div className="animate-fade-up">
    {/* Header */}
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight text-white leading-tight">
          Dashboard
        </h1>
        <p className="text-[13px] text-white/45 mt-1">
          Production workspace — 24 open issues, 3 critical
        </p>
      </div>
      
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <StatsCard label="Open Issues"   value="24"  delta="3 new this week" deltaType="down"    color="violet"  icon="🐛"/>
      <StatsCard label="In Progress"   value="8"   delta="2 unassigned"    deltaType="neutral" color="amber"   icon="⚡"/>
      <StatsCard label="Resolved"      value="13"  delta="5 this week"     deltaType="up"      color="emerald" icon="✓"/>
      <StatsCard label="Critical"      value="3"   delta="Needs attention" deltaType="down"    color="rose"    icon="🚨"/>
      <StatsCard label="Avg Close"     value="2.4d" delta="↓ 0.3d vs last" deltaType="up"     color="cyan"    icon="⏱"/>
    </div>

    {/* Chart + Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 mb-6">
      <div className="glass-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <span className="font-display font-bold text-[15px] tracking-tight text-white">Issue Trends</span>
          <span className="text-[10px] font-mono text-white/25">Last 8 weeks</span>
        </div>
        <div className="p-6">
          <IssueTrendChart/>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-display font-bold text-[15px] tracking-tight text-white">Activity</span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15
                           text-violet-400 border border-violet-500/30 tracking-wide uppercase">
            Live
          </span>
        </div>
        <div className="px-5 py-4">
          <ActivityFeed/>
        </div>
      </div>
    </div>

    {/* Needs attention */}
    <div className="glass-card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <span className="font-display font-bold text-[15px] tracking-tight text-white">
          🚨 Needs Attention
        </span>
        <span className="text-[11px] text-white/30">Unresolved high-priority issues</span>
      </div>
      <div className="px-6">
        {CRITICAL.map((issue, idx) => (
          <div key={issue.id}
            className="flex items-center gap-4 py-3 cursor-pointer animate-fade-up
                       hover:bg-white/[0.025] rounded-lg transition-colors -mx-2 px-2"
            style={{ borderBottom: idx < CRITICAL.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                     animationDelay:`${idx*55}ms` }}>
            <span className="font-mono text-[11px] font-semibold text-violet-400 shrink-0">{issue.id}</span>
            <span className="flex-1 text-[13px] font-medium text-white">{issue.title}</span>
            <span className={`badge ${issue.badge}`}>{issue.sev}</span>
            <button className="btn btn-ghost btn-sm">View</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;