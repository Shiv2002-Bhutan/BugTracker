import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

const data = [
  { day: "Mon", opened: 3, closed: 1 },
  { day: "Tue", opened: 5, closed: 2 },
  { day: "Wed", opened: 2, closed: 3 },
  { day: "Thu", opened: 6, closed: 2 },
  { day: "Fri", opened: 4, closed: 5 },
  { day: "Sat", opened: 1, closed: 3 },
  { day: "Sun", opened: 3, closed: 4 }
]

const IssueTrendChart = () => {

  return (

    <div className="
    bg-zinc-900/70
    border border-zinc-800
    rounded-xl
    p-6
    backdrop-blur-lg
    ">

      <h2 className="text-sm text-zinc-400 mb-4">
        Issue Trend — Last 7 Days
      </h2>

      <div className="h-48">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <XAxis
              dataKey="day"
              stroke="#71717a"
              fontSize={12}
            />

            <YAxis
              stroke="#71717a"
              fontSize={12}
            />

            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a"
              }}
            />

            <Bar
              dataKey="opened"
              fill="#ef4444"
              radius={[4,4,0,0]}
            />

            <Bar
              dataKey="closed"
              fill="#22c55e"
              radius={[4,4,0,0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}

export default IssueTrendChart