import { useEffect, useMemo, useState } from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import IssueTrendChart from '../components/dashboard/IssueTrendChart';
import { useUI } from '../context/UIContext';

const Dashboard = () => {
  const { openNewIssue, openConfig } = useUI();
  const [stats, setStats] = useState(null);
  const [criticalIssues, setCriticalIssues] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const load = async () => {
      try {
        const [statsRes, criticalRes] = await Promise.all([
          fetch(`${API_BASE}/api/stats`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/issues?severity=critical&limit=8`, { signal: controller.signal })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (criticalRes.ok) {
          const issuesData = await criticalRes.json();
          setCriticalIssues(Array.isArray(issuesData) ? issuesData : []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const criticalList = useMemo(() => (
    criticalIssues
      .filter(i => i.status !== 'closed' && i.status !== 'resolved')
      .slice(0, 4)
      .map(i => ({
        id: i.id,
        title: i.title,
        sev: i.severity,
        badge: i.severity === 'critical' ? 'badge-critical'
          : i.severity === 'high' ? 'badge-high'
          : i.severity === 'medium' ? 'badge-medium'
          : 'badge-low'
      }))
  ), [criticalIssues]);

  const openCount = stats?.open ?? '—';
  const criticalCount = stats?.critical ?? '—';
  const inProgressCount = stats?.inProgress ?? '—';
  const resolvedCount = stats?.resolved ?? '—';
  const avgCloseDays = stats?.avgCloseDays;
  const avgCloseLabel = avgCloseDays === null || avgCloseDays === undefined
    ? '—'
    : `${avgCloseDays.toFixed(1)}d`;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight text-white leading-tight">
          Dashboard
        </h1>
        <p className="text-[13px] text-white/45 mt-1">
          Production workspace — {openCount} open issues, {criticalCount} critical
        </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={openConfig}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Configure
          </button>
          <button className="btn btn-primary btn-sm" onClick={openNewIssue}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Issue
          </button>
        </div>
      </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <StatsCard label="Open Issues"   value={openCount}        delta="Active queue"       deltaType="neutral" color="violet"  icon="🐛"/>
      <StatsCard label="In Progress"   value={inProgressCount}  delta="Assigned work"      deltaType="neutral" color="amber"   icon="⚡"/>
      <StatsCard label="Resolved"      value={resolvedCount}    delta="Recently resolved"  deltaType="up"      color="emerald" icon="✓"/>
      <StatsCard label="Critical"      value={criticalCount}    delta="Needs attention"    deltaType="down"    color="rose"    icon="🚨"/>
      <StatsCard label="Avg Close"     value={avgCloseLabel}    delta="Resolution speed"   deltaType="up"      color="cyan"    icon="⏱"/>
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
        {criticalList.map((issue, idx) => (
          <div key={issue.id}
            className="flex items-center gap-4 py-3 cursor-pointer animate-fade-up
                       hover:bg-white/[0.025] rounded-lg transition-colors -mx-2 px-2"
            style={{ borderBottom: idx < criticalList.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
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
};

export default Dashboard;
