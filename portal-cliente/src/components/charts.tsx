import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Row } from "@/lib/api";
import { EmptyState } from "@/components/panels";

export const PALETTE = [
  "#2563eb",
  "#0d9488",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#7c3aed",
  "#ea580c",
  "#16a34a",
  "#db2777",
  "#64748b",
];

const AXIS = { fontSize: 11, fill: "rgb(var(--muted))" } as const;
const GRID = "rgb(var(--border))";

function tooltipStyle() {
  return {
    contentStyle: {
      background: "rgb(var(--surface))",
      border: "1px solid rgb(var(--border))",
      borderRadius: 8,
      fontSize: 12,
      color: "rgb(var(--fg))",
    },
  };
}

export function BarMini({
  data,
  x,
  y,
  color = PALETTE[0],
  height = 260,
}: {
  data: Row[];
  x: string;
  y: string;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <EmptyState compact />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey={x} tick={AXIS} tickLine={false} axisLine={false} interval={0} angle={0} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <Tooltip cursor={{ fill: "rgb(var(--muted) / 0.08)" }} {...tooltipStyle()} />
        <Bar dataKey={y} fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutMini({
  data,
  name,
  value,
  height = 260,
}: {
  data: Row[];
  name: string;
  value: string;
  height?: number;
}) {
  if (data.length === 0) return <EmptyState compact />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={value}
          nameKey={name}
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LineMini({
  data,
  x,
  y,
  color = PALETTE[0],
  height = 260,
}: {
  data: Row[];
  x: string;
  y: string;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <EmptyState compact />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey={x} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <Tooltip {...tooltipStyle()} />
        <Line type="monotone" dataKey={y} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GroupedBar({
  data,
  x,
  series,
  height = 260,
}: {
  data: Row[];
  x: string;
  series: Array<{ key: string; name: string; color: string }>;
  height?: number;
}) {
  if (data.length === 0) return <EmptyState compact />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey={x} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <Tooltip cursor={{ fill: "rgb(var(--muted) / 0.08)" }} {...tooltipStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
