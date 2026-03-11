import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const SUGGESTIONS = ['bug list','bug create','bug close ','bug assign ','bug status ','bug comment ','help','whoami','version','clear'];

const CREATE_STEPS = [
  { key: 'title',       prompt: 'Title:', required: true },
  { key: 'description', prompt: 'Description (optional):', required: false },
  { key: 'severity',    prompt: 'Severity (critical/high/medium/low, default: medium):', required: false },
  { key: 'priority',    prompt: 'Priority (P0/P1/P2/P3, default: P2):', required: false },
  { key: 'assignee',    prompt: 'Assign to (username, optional):', required: false },
  { key: 'tags',        prompt: 'Tags (comma separated, optional):', required: false },
  { key: 'comment',     prompt: 'Initial comment (optional):', required: false },
];

async function process(raw, { token, user }) {
  const cmd = raw.trim().toLowerCase();

  if (cmd === 'clear') return { clear: true };

  if (cmd === 'help') return { lines:[
    { t:'info',    v:'  BugTrack CLI  —  v1.1.0' },
    { t:'blank' },
    { t:'header',  v:'  COMMAND              DESCRIPTION' },
    { t:'divider' },
    { t:'mono',    v:'  bug list            List all open bugs' },
    { t:'mono',    v:'  bug create          Create a new bug report (guided)' },
    { t:'mono',    v:'  bug status <ID>     Get bug status' },
    { t:'mono',    v:'  bug close <ID>      Close a bug' },
    { t:'mono',    v:'  bug assign <ID> --to <user>   Assign to team member' },
    { t:'mono',    v:'  bug comment <ID> \"text\"       Add a comment' },
    { t:'mono',    v:'  whoami              Show current user' },
    { t:'mono',    v:'  version             Show CLI version' },
    { t:'mono',    v:'  clear               Clear terminal' },
    { t:'blank' },
    { t:'muted',   v:"  Tip: Use ↑↓ for history, Tab for autocomplete." },
  ]};

  if (cmd === 'whoami') {
    if (!user) {
      return { lines:[
        { t:'warn',    v:'  Not authenticated.' },
        { t:'muted',   v:'  Sign in from the sidebar to enable protected actions.' },
      ]};
    }
    return { lines:[
      { t:'info',    v:`  Logged in as: ${user.username}` },
      { t:'text',    v:`  Email:       ${user.email || '—'}` },
      { t:'success', v:'  Session:     Active' },
    ]};
  }

  if (cmd === 'version') return { lines:[
    { t:'success', v:'  bugtrack-cli 1.1.0'  },
    { t:'muted',   v:'  node v22.3.0'        },
    { t:'muted',   v:'  platform: linux/x64' },
  ]};

  if (cmd === 'bug list') {
    const bugs = await apiFetch('/api/issues?status=open');
    return { lines:[
      { t:'header',  v:`  ${'ID'.padEnd(10)} ${'TITLE'.padEnd(42)} ${'SEV'.padEnd(10)} STATUS` },
      { t:'divider' },
      ...bugs.map(b => ({ t:'mono', v:`  ${b.id.padEnd(10)} ${String(b.title).slice(0,40).padEnd(42)} ${b.severity.padEnd(10)} ${b.status}` })),
      { t:'blank' },
      { t:'muted',   v:`  ${bugs.length} bugs listed.` },
    ]};
  }

  if (cmd.startsWith('bug status ')) {
    const id = raw.trim().split(' ')[2]?.toUpperCase();
    const b = await apiFetch(`/api/issues/${id}`);
    return { lines:[
      { t:'info',    v:`  ${b.id}`                        },
      { t:'text',    v:`  Title:    ${b.title}`           },
      { t:'text',    v:`  Severity: ${b.severity}`        },
      { t:'success', v:`  Status:   ${b.status}`          },
      { t:'text',    v:`  Assignee: ${b.assignee ?? 'unassigned'}` },
    ]};
  }

  if (cmd.startsWith('bug close ')) {
    if (!token) return { lines:[{ t:'warn', v:'  Sign in required to close bugs.' }] };
    const id = raw.trim().split(' ')[2]?.toUpperCase();
    await apiFetch(`/api/issues/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status: 'closed' })
    });
    return { lines:[
      { t:'success', v:`  ✓ ${id} marked as closed.` },
      { t:'muted',   v:'  Status update logged to activity timeline.' },
    ]};
  }

  if (cmd.startsWith('bug assign ')) {
    if (!token) return { lines:[{ t:'warn', v:'  Sign in required to assign bugs.' }] };
    const parts = raw.trim().split(' ');
    const id    = parts[2]?.toUpperCase();
    const toIdx = parts.map(p=>p.toLowerCase()).indexOf('--to');
    const username  = toIdx >= 0 ? parts[toIdx+1] : null;
    if (!id || !username) return { lines:[{ t:'warn', v:'  Usage: bug assign <ID> --to <username>' }] };
    const users = await apiFetch('/api/users', { token });
    const match = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!match) return { lines:[{ t:'error', v:`  User not found: ${username}` }] };
    await apiFetch(`/api/issues/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ assigneeId: match.id })
    });
    return { lines:[
      { t:'success', v:`  ✓ ${id} assigned to @${username}` },
      { t:'muted',   v:'  Notification sent.' },
    ]};
  }

  if (cmd.startsWith('bug comment ')) {
    if (!token) return { lines:[{ t:'warn', v:'  Sign in required to comment.' }] };
    const m = raw.trim().match(/bug comment (BUG-\\d+) (.+)/i);
    if (!m) return { lines:[{ t:'warn', v:'  Usage: bug comment <ID> \"text\"' }] };
    await apiFetch(`/api/issues/${m[1].toUpperCase()}/comments`, {
      method: 'POST',
      token,
      body: JSON.stringify({ comment: m[2] })
    });
    return { lines:[
      { t:'success', v:`  ✓ Comment added to ${m[1].toUpperCase()}` },
      { t:'muted',   v:`  Comment: ${m[2]}` },
    ]};
  }

  return { lines:[
    { t:'error', v:`  Command not found: '${raw.trim()}'` },
    { t:'muted', v:"  Run 'help' to see available commands." },
  ]};
}

const LINE_STYLE = {
  success: 'text-emerald-400',
  error:   'text-rose-400',
  warn:    'text-amber-400',
  info:    'text-cyan-400',
  muted:   'text-white/25',
  header:  'text-white/50 font-semibold',
  divider: 'text-white/10',
  mono:    'text-white/60',
  accent:  'text-violet-400 font-bold',
  text:    'text-white/55',
  blank:   '',
};

const BOOT = [
  { t:'accent',  v:'  ██████╗ ██╗   ██╗ ██████╗ ' },
  { t:'accent',  v:'  ██╔══██╗██║   ██║██╔════╝ ' },
  { t:'accent',  v:'  ██████╔╝██║   ██║██║  ███╗' },
  { t:'accent',  v:'  ██╔══██╗██║   ██║██║   ██║' },
  { t:'accent',  v:'  ██████╔╝╚██████╔╝╚██████╔╝' },
  { t:'accent',  v:'  ╚═════╝  ╚═════╝  ╚═════╝ ' },
  { t:'blank' },
  { t:'info',    v:'  BugTrack CLI  v1.0.0  —  Production' },
  { t:'muted',   v:"  Type 'help' to see all available commands." },
  { t:'blank' },
];

const Terminal = () => {
  const [history, setHistory]     = useState([{ cmd:null, lines:BOOT }]);
  const [input, setInput]         = useState('');
  const [cmdHist, setCmdHist]     = useState([]);
  const [histIdx, setHistIdx]     = useState(-1);
  const [ghost, setGhost]         = useState('');
  const [createFlow, setCreateFlow] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const { token, user } = useAuth();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [history]);

  const handleChange = val => {
    setInput(val);
    const match = val.length > 0
      ? SUGGESTIONS.find(s => s.startsWith(val.toLowerCase()) && s !== val.toLowerCase())
      : '';
    setGhost(match ? match.slice(val.length) : '');
  };

  const appendLines = (cmd, lines) => {
    setHistory(h => [...h, { cmd, lines }]);
  };

  const startCreateFlow = () => {
    setCreateFlow({ step: 0, data: {} });
    appendLines(input.trim(), [
      { t:'info', v:'  Starting guided issue creation…' },
      { t:'text', v:`  ${CREATE_STEPS[0].prompt}` },
    ]);
  };

  const handleCreateAnswer = async (answer) => {
    const step = CREATE_STEPS[createFlow.step];
    const data = { ...createFlow.data };
    const trimmed = answer.trim();

    if (step.required && !trimmed) {
      appendLines(answer.trim(), [
        { t:'warn', v:`  ${step.key} is required.` },
        { t:'text', v:`  ${step.prompt}` },
      ]);
      return;
    }

    if (step.key === 'severity') {
      const val = trimmed ? trimmed.toLowerCase() : 'medium';
      if (!['critical','high','medium','low'].includes(val)) {
        appendLines(answer.trim(), [
          { t:'warn', v:'  Invalid severity. Use critical/high/medium/low.' },
          { t:'text', v:`  ${step.prompt}` },
        ]);
        return;
      }
      data.severity = val;
    } else if (step.key === 'priority') {
      const val = trimmed ? trimmed.toUpperCase() : 'P2';
      if (!['P0','P1','P2','P3'].includes(val)) {
        appendLines(answer.trim(), [
          { t:'warn', v:'  Invalid priority. Use P0/P1/P2/P3.' },
          { t:'text', v:`  ${step.prompt}` },
        ]);
        return;
      }
      data.priority = val;
    } else if (step.key === 'assignee') {
      data.assignee = trimmed || '';
    } else if (step.key === 'tags') {
      data.tags = trimmed;
    } else if (step.key === 'comment') {
      data.comment = trimmed;
    } else {
      data[step.key] = trimmed;
    }

    const nextStep = createFlow.step + 1;
    if (nextStep >= CREATE_STEPS.length) {
      if (!token) {
        appendLines(answer.trim(), [
          { t:'warn', v:'  Sign in required to create bugs.' },
        ]);
        setCreateFlow(null);
        return;
      }

      try {
        let assigneeId = null;
        if (data.assignee) {
          const users = await apiFetch('/api/users', { token });
          const match = users.find(u => u.username.toLowerCase() === data.assignee.toLowerCase());
          if (!match) {
            appendLines(answer.trim(), [
              { t:'warn', v:`  User not found: ${data.assignee}` },
              { t:'text', v:'  Please re-enter assignee (or leave blank):' },
            ]);
            setCreateFlow({ step: CREATE_STEPS.findIndex(s => s.key === 'assignee'), data });
            return;
          }
          assigneeId = match.id;
        }

        const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const created = await apiFetch('/api/issues', {
          method: 'POST',
          token,
          body: JSON.stringify({
            title: data.title,
            description: data.description || null,
            severity: data.severity || 'medium',
            priority: data.priority || 'P2',
            assigneeId,
            tags
          })
        });

        if (data.comment) {
          await apiFetch(`/api/issues/${created.id}/comments`, {
            method: 'POST',
            token,
            body: JSON.stringify({ comment: data.comment })
          });
        }

        appendLines(answer.trim(), [
          { t:'success', v:`  ✓ Bug created: ${created.id}` },
          { t:'text',    v:`  Status:   ${created.status}` },
          { t:'text',    v:`  Reporter: ${user?.username || '—'}` },
          { t:'muted',   v:`  Created:  ${new Date().toLocaleString()}` },
        ]);
      } catch (err) {
        appendLines(answer.trim(), [
          { t:'error', v:`  ${err.message || 'Failed to create issue'}` },
        ]);
      } finally {
        setCreateFlow(null);
      }
      return;
    }

    setCreateFlow({ step: nextStep, data });
    appendLines(answer.trim(), [
      { t:'text', v:`  ${CREATE_STEPS[nextStep].prompt}` },
    ]);
  };

  const submit = async () => {
    if (!input.trim()) return;

    if (createFlow) {
      const answer = input;
      setInput('');
      setGhost('');
      await handleCreateAnswer(answer);
      return;
    }

    if (input.trim().toLowerCase().startsWith('bug create')) {
      if (!token) {
        appendLines(input.trim(), [
          { t:'warn', v:'  Sign in required to create bugs.' },
        ]);
        setCmdHist(h => [input.trim(), ...h]);
        setHistIdx(-1);
        setInput('');
        setGhost('');
        return;
      }
      startCreateFlow();
      setCmdHist(h => [input.trim(), ...h]);
      setHistIdx(-1);
      setInput('');
      setGhost('');
      return;
    }

    try {
      const result = await process(input, { token, user });
      if (result.clear) {
        setHistory([{ cmd:null, lines:BOOT }]);
      } else {
        appendLines(input.trim(), result.lines);
      }
    } catch (err) {
      appendLines(input.trim(), [
        { t:'error', v:`  ${err.message || 'Command failed'}` },
      ]);
    }
    setCmdHist(h => [input.trim(), ...h]);
    setHistIdx(-1);
    setInput('');
    setGhost('');
  };

  const onKeyDown = e => {
    if (e.key === 'Enter')     { submit(); return; }
    if (e.key === 'Tab')       { e.preventDefault(); if (ghost) { setInput(input+ghost); setGhost(''); } return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); const n=Math.min(histIdx+1,cmdHist.length-1); setHistIdx(n); if(cmdHist[n]) setInput(cmdHist[n]); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); const n=Math.max(histIdx-1,-1); setHistIdx(n); setInput(n>=0?cmdHist[n]:''); return; }
  };

  return (
    <div className="terminal-wrapper">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.025] border-b border-white/[0.07]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/>
        <span className="w-3 h-3 rounded-full bg-[#febc2e]"/>
        <span className="w-3 h-3 rounded-full bg-[#28c840]"/>
        <span className="flex-1 text-center text-[10px] font-mono text-white/25">
          bugtrack — terminal
        </span>
      </div>

      <div
        className="h-[420px] overflow-y-auto p-5 font-mono text-[12.5px] leading-relaxed cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, ei) => (
          <div key={ei}>
            {entry.cmd && (
              <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
                <span className="text-violet-400 font-semibold text-[11px]">dev@bugtrack</span>
                <span className="text-cyan-500/70 text-[11px]">~/workspace</span>
                <span className="text-white/25 text-[11px] mx-0.5">$</span>
                <span className="text-white text-[12px]">{entry.cmd}</span>
              </div>
            )}
            {entry.lines?.map((line, li) => (
              <div key={li}
                className={`whitespace-pre leading-[1.7] text-[12px] font-mono
                            ${LINE_STYLE[line.t] || 'text-white/55'}`}>
                {line.t === 'blank' ? '\u00A0' : line.t === 'divider' ? `  ${'─'.repeat(68)}` : line.v}
              </div>
            ))}
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <div className="border-t border-white/[0.07] px-5 py-3 flex items-center gap-2">
        <span className="text-violet-400 font-semibold text-[11px] font-mono whitespace-nowrap">dev@bugtrack</span>
        <span className="text-cyan-500/70 text-[11px] font-mono whitespace-nowrap">~/workspace</span>
        <span className="text-white/25 text-[11px]">$</span>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent outline-none text-white text-[12px] font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          {ghost && (
            <span className="absolute left-0 top-0 text-white/20 text-[12px] font-mono pointer-events-none">
              {input}{ghost}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
