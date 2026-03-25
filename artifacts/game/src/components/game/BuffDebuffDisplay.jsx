import React from "react";
import { motion } from "framer-motion";
import { Shield, Flame, Cloud, Skull, Zap, Droplets } from "lucide-react";

const BUFF_CONFIG = {
  damage_increase: { icon: Flame, color: "text-orange-400", label: "DMG+", bg: "bg-orange-500/20 border-orange-500/30" },
  defense_increase: { icon: Shield, color: "text-blue-400", label: "DEF+", bg: "bg-blue-500/20 border-blue-500/30" },
  regen_boost: { icon: Droplets, color: "text-green-400", label: "REGEN", bg: "bg-green-500/20 border-green-500/30" },
  attack_buff: { icon: Zap, color: "text-yellow-400", label: "ATK+", bg: "bg-yellow-500/20 border-yellow-500/30" },
};

const DEBUFF_CONFIG = {
  burn: { icon: Flame, color: "text-red-500", label: "BURN", bg: "bg-red-500/20 border-red-500/30" },
  poison: { icon: Cloud, color: "text-green-500", label: "POISON", bg: "bg-green-500/20 border-green-500/30" },
  bleed: { icon: Droplets, color: "text-rose-500", label: "BLEED", bg: "bg-rose-500/20 border-rose-500/30" },
  freeze: { icon: Zap, color: "text-cyan-400", label: "FREEZE", bg: "bg-cyan-500/20 border-cyan-500/30" },
  weakness: { icon: Skull, color: "text-purple-400", label: "WEAK", bg: "bg-purple-500/20 border-purple-500/30" },
};

export default function BuffDebuffDisplay({ buffs = [], debuffs = [], position = "player" }) {
  const allEffects = [
    ...buffs.map(b => ({ ...b, type: "buff", config: BUFF_CONFIG[b.type] })),
    ...debuffs.map(d => ({ ...d, type: "debuff", config: DEBUFF_CONFIG[d.type] })),
  ].filter(e => e.config);

  if (allEffects.length === 0) return null;

  return (
    <div className={`flex gap-1 justify-${position === "player" ? "start" : "end"} flex-wrap`}>
      {allEffects.map((effect, idx) => {
        const Icon = effect.config.icon;
        const durationPercent = effect.duration ? Math.min(100, (effect.remaining / effect.duration) * 100) : 100;
        
        return (
          <motion.div
            key={`${effect.type}_${effect.id || idx}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`relative flex items-center justify-center w-6 h-6 rounded border ${effect.config.bg}`}
            title={`${effect.config.label}${effect.remaining ? ` (${Math.ceil(effect.remaining)}s)` : ""}`}
          >
            <Icon className={`w-3 h-3 ${effect.config.color}`} />
            {effect.duration && (
              <div className="absolute inset-0 rounded border-current" style={{
                borderColor: `${effect.type === "buff" ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"}`,
                background: `conic-gradient(${effect.type === "buff" ? "rgb(34,197,94)" : "rgb(239,68,68)"} ${durationPercent}%, transparent ${durationPercent}%)`,
                opacity: 0.1,
              }} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}