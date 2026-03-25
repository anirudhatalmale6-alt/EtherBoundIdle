import React from "react";

export default function StatDisplay({ icon: Icon, label, value, color = "text-foreground" }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{label}</span>
      </div>
      <span className={`font-semibold text-sm ${color}`}>{value}</span>
    </div>
  );
}