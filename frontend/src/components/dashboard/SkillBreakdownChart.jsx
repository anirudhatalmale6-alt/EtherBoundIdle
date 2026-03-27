import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CLASSES } from "@/lib/gameData";

export default function SkillBreakdownChart({ character }) {
  const cls = CLASSES[character.class] || {};
  const skills = cls.skills || [];

  // Create dummy data based on character class skills
  const data = [
    { name: "Combat", value: 40 },
    { name: "Defense", value: 25 },
    { name: "Utility", value: 20 },
    { name: "Special", value: 15 },
  ];

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value) => `${value}%`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}