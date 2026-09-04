"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const months = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export default function CasesChart({ values }: { values: number[] }) {
  const data = months.map((month, index) => ({
    mois: month,
    cas: values[index] ?? 0,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cas"
            stroke="#0369a1"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}