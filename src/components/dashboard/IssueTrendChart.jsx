import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts"
import { apiFetch } from "../../lib/api"

const formatDay = (dateString) => {
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

const IssueTrendChart = () => {
  const [data, setData] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    apiFetch("/api/trends?days=7")
      .then(rows => {
        if (!active) return
        const mapped = (Array.isArray(rows) ? rows : []).map(r => ({
          day: formatDay(r.day),
          opened: Number(r.opened || 0),
          closed: Number(r.closed || 0)
        }))
        setData(mapped)
      })
      .catch(() => { if (active) setError("Failed to load trends") })
    return () => { active = false }
  }, [])

  const totalOpened = useMemo(() => data.reduce((acc, d) => acc + d.opened, 0), [data])
  const totalClosed = useMemo(() => data.reduce((acc, d) => acc + d.closed, 0), [data])

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-zinc-400">Issue Trend — Last 7 Days</h2>
        <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">
            Opened {totalOpened}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            Closed {totalClosed}
          </span>
        </div>
      </div>

      <div className="h-56">
        {error ? (
          <div className="text-[11px] text-rose-300/80">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="openedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="closedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1f2937" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 11 }} />
              <Area type="monotone" dataKey="opened" stroke="#f43f5e" fill="url(#openedFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="closed" stroke="#10b981" fill="url(#closedFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default IssueTrendChart
