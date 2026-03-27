import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { calculateFinalStats } from "@/lib/statSystem";

export default function CombatStatsChart({ character }) {
  if (!character) return null;
  const { derived } = calculateFinalStats(character, []);

  // Normalize stats to 0-100 scale for radar chart visibility
  const normalizeValue = (value, max) => {
    return Math.min(100, (value / max) * 100);
  };

  const data = [
    { stat: "Attack", value: normalizeValue(derived.attackPower, 200) },
    { stat: "Defense", value: normalizeValue(derived.rawDefense, 150) },
    { stat: "Crit %", value: Math.min(100, derived.critChance) },
    { stat: "HP Regen", value: normalizeValue(derived.hpRegen, 20) },
    { stat: "MP Regen", value: normalizeValue(derived.mpRegen, 20) },
    { stat: "Evasion", value: Math.min(100, derived.evasion) },
    { stat: "Block %", value: Math.min(100, derived.blockChance) },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="stat" stroke="hsl(var(--muted-foreground))" style={{ fontSize: 11 }} />
        <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: 11 }} domain={[0, 100]} />
        <Radar name="Combat Stats" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value) => `${value.toFixed(1)}/100`}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}