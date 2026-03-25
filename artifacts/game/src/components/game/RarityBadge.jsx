import React from "react";
import { RARITY_CONFIG } from "@/lib/gameData";

/**
 * Universal rarity badge used across all item types.
 * Shiny items get an animated gold glow.
 */
export default function RarityBadge({ rarity, size = "sm", showLabel = true }) {
  const cfg = RARITY_CONFIG[rarity];
  if (!cfg) return null;

  const sizeClass = size === "xs" ? "text-[10px] px-1 py-0" : "text-xs px-1.5 py-0.5";

  return (
    <span
      className={`
        inline-flex items-center rounded font-bold leading-tight border
        ${cfg.color} ${cfg.bg} ${cfg.border} ${sizeClass}
        ${cfg.animated ? "animate-pulse ring-1 ring-yellow-400/50" : ""}
      `}
    >
      {showLabel ? cfg.label : rarity}
    </span>
  );
}