import { useState } from 'react';
import IssuesTable from '../components/issues/IssuesTable';

const FormLabel = ({ children }) => (
  <label className="block text-[9px] font-mono font-semibold tracking-[0.1em] uppercase
                     text-white/30 mb-1.5">
    {children}
  </label>
);

const Issues = () => {
  const [modal, setModal] = useState(false);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-white leading-tight">Issues</h1>
          <p className="text-[13px] text-white/45 mt-1">Track, filter and manage all reported bugs</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
          </button>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(true)}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Issue
          </button>
        </div>
      </div>

      <IssuesTable/>

      {/* ── Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center
                     justify-center p-4 animate-fade-up"
          onClick={e => { if(e.target===e.currentTarget) setModal(false); }}
        >
          <div className="glass-card w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <span className="font-display font-bold text-[15px] text-white tracking-tight">
                Create New Issue
              </span>
              <button className="btn btn-ghost btn-icon" onClick={()=>setModal(false)}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <FormLabel>Title *</FormLabel>
                <input className="field" placeholder="Brief description of the bug…"/>
              </div>
              <div>
                <FormLabel>Description</FormLabel>
                <textarea className="field resize-y" rows={4}
                  placeholder="Steps to reproduce, expected vs actual behavior…"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Severity</FormLabel>
                  <select className="field select">
                    <option value="">Select…</option>
                    <option>Critical</option><option>High</option>
                    <option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <FormLabel>Priority</FormLabel>
                  <select className="field select">
                    <option value="">Select…</option>
                    <option value="p0">P0 — Blocker</option>
                    <option value="p1">P1 — Critical</option>
                    <option value="p2">P2 — Major</option>
                    <option value="p3">P3 — Minor</option>
                  </select>
                </div>
              </div>
              <div>
                <FormLabel>Assignee</FormLabel>
                <select className="field select">
                  <option value="">Unassigned</option>
                  <option>DEV 1</option><option>DEV 2</option>
                  <option>DEV 3</option><option>DEV 4</option>
                  <option>DEV 5</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={()=>setModal(false)}>Create Issue</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Issues;