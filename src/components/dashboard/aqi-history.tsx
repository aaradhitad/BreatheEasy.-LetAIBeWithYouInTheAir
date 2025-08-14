"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export interface AqiHistoryPoint {
  date: string; // e.g., 2025-08-13
  value: number; // average AQI for that date
}

interface AqiHistoryProps {
  data: AqiHistoryPoint[];
}

export function AqiHistoryChart({ data }: AqiHistoryProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: d.value,
    }));
  }, [data]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-lg">Past Week AQI</h3>
        <span className="text-xs text-slate-400">Daily average (US AQI)</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#475569' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#475569' }} domain={[0, 500]} tickCount={6} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} cursor={{ stroke: '#475569' }} />
            <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, stroke: '#0891b2', strokeWidth: 2 }} activeDot={{ r: 5 }}>
              <LabelList dataKey="value" position="top" fill="#bae6fd" fontSize={11} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


