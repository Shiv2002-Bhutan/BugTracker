import { useState, useRef, useEffect } from 'react';

/* ── Command processor ──────────────────────────────────── */
const BUGS = [
  { id:'BUG-044', title:'Memory leak in WebSocket handler',          sev:'critical', status:'open',        by:'DEV 1'  },
  { id:'BUG-043', title:'Login redirect loop on OAuth callback',     sev:'high',     status:'in_progress', by:'DEV 2'    },
  { id:'BUG-041', title:'Race condition in concurrent file uploads', sev:'high',     status:'in_progress', by:'DEV 3'     },
  { id:'BUG-038', title:'Dashboard chart blank on Safari 17',        sev:'medium',   status:'open',        by:'DEV 4'   },
  { id:'BUG-033', title:'Tooltip overflows viewport on mobile',      sev:'low',      status:'open',        by:'DEV 5'        },
];

const SUGGESTIONS = ['bug list','bug create','bug close ','bug assign ','bug status ','bug comment ','help','whoami','version','clear'];

function process(raw) {
  const cmd = raw.trim().toLowerCase();

  if (cmd === 'clear') return { clear: true };

  if (cmd === 'help') return { lines:[
    { t:'info',    v:'  BugTrack CLI  —  v1.1.0' },
    { t:'blank' },
    { t:'header',  v:'  COMMAND              DESCRIPTION' },
    { t:'divider' },
    { t:'mono',    v:'  bug list            List all open bugs' },
    { t:'mono',    v:'  bug create          Create a new bug report' },
    { t:'mono',    v:'  bug status <ID>     Get bug status' },
    { t:'mono',    v:'  bug close <ID>      Close a bug' },
    { t:'mono',    v:'  bug assign <ID> --to <user>   Assign to team member' },
    { t:'mono',    v:'  bug comment <ID> "text"       Add a comment' },
    { t:'mono',    v:'  whoami              Show current user' },
    { t:'mono',    v:'  version             Show CLI version' },
    { t:'mono',    v:'  clear               Clear terminal' },
    { t:'blank' },
    { t:'muted',   v:"  Tip: Use ↑↓ for history, Tab for autocomplete." },
  ]};

  if (cmd === 'whoami') return { lines:[
    { t:'info',    v:'  Logged in as: DEV 1'       },
    { t:'text',    v:'  Role:         Admin'           },
    { t:'text',    v:'  Workspace:    BugTrack / Prod' },
    { t:'success', v:'  Session:      Active (6h)'     },
  ]};

  if (cmd === 'version') return { lines:[
    { t:'success', v:'  bugtrack-cli 1.1.0'  },
    { t:'muted',   v:'  node v22.3.0'        },
    { t:'muted',   v:'  platform: linux/x64' },
  ]};

  if (cmd === 'bug list') return { lines:[
    { t:'header',  v:`  ${'ID'.padEnd(10)} ${'TITLE'.padEnd(42)} ${'SEV'.padEnd(10)} STATUS` },
    { t:'divider' },
    ...BUGS.map(b => ({ t:'mono', v:`  ${b.id.padEnd(10)} ${b.title.slice(0,40).padEnd(42)} ${b.sev.padEnd(10)} ${b.status}` })),
    { t:'blank' },
    { t:'muted',   v:`  ${BUGS.length} bugs listed.` },
  ]};

  if (cmd.startsWith('bug status ')) {
    const id = raw.trim().split(' ')[2]?.toUpperCase();
    const b  = BUGS.find(x => x.id === id);
    if (!b) return { lines:[{ t:'error', v:`  Error: ${id} not found.` }] };
    return { lines:[
      { t:'info',    v:`  ${b.id}`                        },
      { t:'text',    v:`  Title:    ${b.title}`           },
      { t:'text',    v:`  Severity: ${b.sev}`             },
      { t:'success', v:`  Status:   ${b.status}`          },
      { t:'text',    v:`  Assignee: ${b.by ?? 'unassigned'}` },
    ]};
  }

  if (cmd.startsWith('bug close ')) {
    const id = raw.trim().split(' ')[2]?.toUpperCase();
    const b  = BUGS.find(x => x.id === id);
    if (!b) return { lines:[{ t:'error', v:`  Error: ${id} not found.` }] };
    return { lines:[
      { t:'success', v:`  ✓ ${b.id} marked as closed.`              },
      { t:'muted',   v:'  Status update logged to activity timeline.' },
    ]};
  }

  if (cmd.startsWith('bug assign ')) {
    const parts = raw.trim().split(' ');
    const id    = parts[2]?.toUpperCase();
    const toIdx = parts.map(p=>p.toLowerCase()).indexOf('--to');
    const user  = toIdx >= 0 ? parts[toIdx+1] : null;
    if (!id || !user) return { lines:[{ t:'warn', v:'  Usage: bug assign <ID> --to <username>' }] };
    return { lines:[
      { t:'success', v:`  ✓ ${id} assigned to @${user}` },
      { t:'muted',   v:'  Notification sent.'           },
    ]};
  }

  if (cmd.startsWith('bug create')) return { lines:[
    { t:'success', v:'  ✓ Bug created: BUG-045'                       },
    { t:'text',    v:'  Status:   open'                               },
    { t:'text',    v:'  Reporter: DEV 1'                           },
    { t:'muted',   v:`  Created:  ${new Date().toLocaleString()}`     },
  ]};

  if (cmd.startsWith('bug comment ')) {
    const m = raw.trim().match(/bug comment (BUG-\d+) (.+)/i);
    if (!m) return { lines:[{ t:'warn', v:'  Usage: bug comment <ID> "text"' }] };
    return { lines:[
      { t:'success', v:`  ✓ Comment added to ${m[1].toUpperCase()}` },
      { t:'muted',   v:`  Comment: ${m[2]}`                         },
    ]};
  }

  return { lines:[
    { t:'error', v:`  Command not found: '${raw.trim()}'`      },
    { t:'muted', v:"  Run 'help' to see available commands." },
  ]};
}

/* ── Color map ─────────────────────────────────────────── */
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

/* ── Terminal ───────────────────────────────────────────── */
const Terminal = () => {
  const [history, setHistory]     = useState([{ cmd:null, lines:BOOT }]);
  const [input, setInput]         = useState('');
  const [cmdHist, setCmdHist]     = useState([]);
  const [histIdx, setHistIdx]     = useState(-1);
  const [ghost, setGhost]         = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [history]);

  const handleChange = val => {
    setInput(val);
    const match = val.length > 0
      ? SUGGESTIONS.find(s => s.startsWith(val.toLowerCase()) && s !== val.toLowerCase())
      : '';
    setGhost(match ? match.slice(val.length) : '');
  };

  const submit = () => {
    if (!input.trim()) return;
    const result = process(input);
    if (result.clear) {
      setHistory([{ cmd:null, lines:BOOT }]);
    } else {
      setHistory(h => [...h, { cmd:input.trim(), lines:result.lines }]);
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
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.025] border-b border-white/[0.07]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/>
        <span className="w-3 h-3 rounded-full bg-[#febc2e]"/>
        <span className="w-3 h-3 rounded-full bg-[#28c840]"/>
        <span className="flex-1 text-center text-[10px] font-mono text-white/25">
          bugtrack — terminal
        </span>
      </div>

      {/* Output area */}
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

      {/* Input row */}
      <div className="flex items-center gap-1.5 border-t border-white/[0.07] px-5 py-3 bg-black/20">
        <span className="text-violet-400 font-semibold text-[11px] font-mono whitespace-nowrap">dev@bugtrack</span>
        <span className="text-cyan-500/70 text-[11px] font-mono">~/workspace</span>
        <span className="text-white/25 text-[11px] font-mono mx-1">$</span>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none border-none text-white font-mono text-[12.5px]
                       caret-violet-400"
            value={input}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          {ghost && (
            <span
              className="absolute left-0 top-0 text-white/20 font-mono text-[12.5px] pointer-events-none whitespace-pre"
              style={{ paddingLeft: `${input.length}ch` }}
            >
              {ghost}
            </span>
          )}
        </div>
      </div>

      {/* Hints */}
      <div className="flex gap-5 px-5 py-1.5 border-t border-white/[0.05] bg-black/10 flex-wrap">
        {['↑↓ history','Tab autocomplete','Enter run',"'help' for commands"].map(h => (
          <span key={h} className="text-[9px] font-mono text-white/18">{h}</span>
        ))}
      </div>
    </div>
  );
};

export default Terminal;