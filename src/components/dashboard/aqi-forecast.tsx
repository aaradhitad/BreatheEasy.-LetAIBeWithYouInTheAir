"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Legend,
  ReferenceArea,
} from "recharts";

export interface AqiForecastPoint {
  date: string; // YYYY-MM-DD
  value: number; // forecast AQI
}

interface AqiForecastProps {
  data: AqiForecastPoint[];
}

export function AqiForecastChart({ data }: AqiForecastProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: d.value,
    }));
  }, [data]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-lg">Next 7 Days AQI Forecast</h3>
        <span className="text-xs text-slate-400">Daily average (index)</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#475569' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#475569' }} domain={[0, 500]} tickCount={6} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} cursor={{ stroke: '#475569' }} />
            <ReferenceArea y1={0} y2={50} fill="#16a34a" fillOpacity={0.08} />
            <ReferenceArea y1={51} y2={100} fill="#eab308" fillOpacity={0.08} />
            <ReferenceArea y1={101} y2={150} fill="#f97316" fillOpacity={0.08} />
            <ReferenceArea y1={151} y2={200} fill="#ef4444" fillOpacity={0.08} />
            <ReferenceArea y1={201} y2={300} fill="#a855f7" fillOpacity={0.08} />
            <ReferenceArea y1={301} y2={500} fill="#7f1d1d" fillOpacity={0.08} />
            <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#aqiGrad)" strokeWidth={2} dot={{ r: 3, stroke: '#0891b2', strokeWidth: 2 }} activeDot={{ r: 5 }}>
              <LabelList dataKey="value" position="top" fill="#bae6fd" fontSize={11} />
            </Area>
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 8 }}
              payload={[
                { value: 'Good', type: 'square', color: '#16a34a' },
                { value: 'Moderate', type: 'square', color: '#eab308' },
                { value: 'USG', type: 'square', color: '#f97316' },
                { value: 'Unhealthy', type: 'square', color: '#ef4444' },
                { value: 'Very Unhealthy', type: 'square', color: '#a855f7' },
                { value: 'Hazardous', type: 'square', color: '#7f1d1d' },
              ]}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {data && data.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {data.map((d) => (
            <div key={d.date} className="text-center rounded-md border border-slate-700 bg-slate-900/40 px-2 py-1">
              <div className="text-[10px] text-slate-400">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className="text-xs text-slate-300">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
              <div className="text-sm font-semibold text-cyan-300">{d.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


