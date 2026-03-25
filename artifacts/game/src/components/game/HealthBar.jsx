import React from "react";
import { motion } from "framer-motion";

export default function HealthBar({ current, max, color = "bg-red-500", label, showText = true, height = "h-3" }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{label}</span>
          {showText && <span className="text-foreground font-medium">{Math.round(current)}/{max}</span>}
        </div>
      )}
      <div className={`w-full ${height} bg-muted rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}