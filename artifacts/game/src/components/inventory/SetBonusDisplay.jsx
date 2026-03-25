import React from "react";
import { motion } from "framer-motion";
import { calculateSetBonuses } from "@/lib/setSystem";

export default function SetBonusDisplay({ equippedItems }) {
  if (!equippedItems || equippedItems.length === 0) return null;

  const setBonuses = calculateSetBonuses(equippedItems);
  const activeSets = Object.values(setBonuses);
  if (activeSets.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Set Bonuses</h3>
      {activeSets.map(({ set, equippedCount, totalPieces, activeBonuses }) => {
        const isFull = equippedCount >= totalPieces;
        const thresholds = Object.keys(set.bonuses).map(Number).sort((a, b) => a - b);
        return (
          <motion.div
            key={set.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 space-y-2 ${
              isFull
                ? `${set.borderColor} bg-gradient-to-br from-yellow-500/5 to-transparent animate-pulse-slow`
                : `${set.borderColor} bg-card/80`
            }`}
          >
            {/* Set Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{set.icon}</span>
                <span className={`text-sm font-bold ${set.color}`}>{set.name}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isFull
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
                  : `${set.borderColor} ${set.color} bg-muted/40`
              }`}>
                {equippedCount}/{totalPieces}
              </span>
            </div>

            {/* Bonus tiers */}
            <div className="space-y-1">
              {thresholds.map(threshold => {
                const bonus = set.bonuses[threshold];
                const isActive = equippedCount >= threshold;
                const isFinalTier = threshold === thresholds[thresholds.length - 1];
                return (
                  <div
                    key={threshold}
                    className={`flex items-start gap-2 text-xs rounded-lg px-2 py-1.5 ${
                      isActive
                        ? isFinalTier
                          ? "bg-yellow-500/10 border border-yellow-500/30"
                          : "bg-primary/10 border border-primary/20"
                        : "opacity-40"
                    }`}
                  >
                    <span className={`flex-shrink-0 mt-0.5 ${isActive ? (isFinalTier ? "text-yellow-400" : "text-primary") : "text-muted-foreground"}`}>
                      {isActive ? "✔" : "🔒"}
                    </span>
                    <div>
                      <span className={`font-semibold ${isActive ? (isFinalTier ? "text-yellow-300" : "text-foreground") : "text-muted-foreground"}`}>
                        ({threshold}/{totalPieces}) 
                      </span>
                      <span className={isActive ? (isFinalTier ? "text-yellow-200" : "text-muted-foreground") : "text-muted-foreground"}>
                        {" "}{bonus.label}
                      </span>
                      {isFinalTier && isActive && (
                        <span className="ml-1 text-yellow-400 animate-pulse">★ FULL BONUS</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full set glow border effect */}
            {isFull && (
              <div className={`text-center text-xs font-bold py-1 rounded-lg bg-yellow-500/15 ${set.color}`}>
                ✨ Full Set Bonus Active! ✨
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}