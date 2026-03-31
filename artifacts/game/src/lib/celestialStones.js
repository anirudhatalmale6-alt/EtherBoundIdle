// ===== CELESTIAL STONES & BOSS GATING SYSTEM =====
// Celestial Stones are special material items that gate access to boss stages.
// Each zone boss drops a stone that unlocks the next tier.

// ─────────────────────────────────────────────────────────────────────────────
// STONE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
export const CELESTIAL_STONES = {
  forest_stone: {
    id: "forest_stone",
    name: "Emerald Heartstone",
    icon: "💎",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    description: "A pulsing emerald crystal dropped by the Forest Guardian. Required to challenge the Desert Wyrm.",
    droppedBy: "forest_guardian",
    dropChance: 0.25,
    unlocksZone: "scorched_desert",
    unlocksBoss: "desert_wyrm",
    requiredLevel: 10,
  },
  desert_stone: {
    id: "desert_stone",
    name: "Solar Keystone",
    icon: "☀️",
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
    description: "A fragment of condensed sunlight from the Desert Wyrm. Required to challenge the Frost Dragon.",
    droppedBy: "desert_wyrm",
    dropChance: 0.20,
    unlocksZone: "frozen_peaks",
    unlocksBoss: "frost_dragon",
    requiredLevel: 25,
  },
  frost_stone: {
    id: "frost_stone",
    name: "Glacial Core",
    icon: "❄️",
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/40",
    description: "An ever-frozen crystal from the Frost Dragon's heart. Required to enter the Shadow Realm boss.",
    droppedBy: "frost_dragon",
    dropChance: 0.15,
    unlocksZone: "shadow_realm",
    unlocksBoss: "shadow_lord",
    requiredLevel: 45,
  },
  shadow_stone: {
    id: "shadow_stone",
    name: "Void Shard",
    icon: "🌑",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
    description: "A fragment of pure void energy from the Shadow Lord. Required to challenge the Cosmic Overlord.",
    droppedBy: "shadow_lord",
    dropChance: 0.10,
    unlocksZone: "celestial_spire",
    unlocksBoss: "cosmic_overlord",
    requiredLevel: 70,
  },
  celestial_stone: {
    id: "celestial_stone",
    name: "Celestial Fragment",
    icon: "✨",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20",
    border: "border-yellow-400/50",
    description: "A piece of the Celestial Spire itself. Used for the highest tier crafting and upgrades.",
    droppedBy: "cosmic_overlord",
    dropChance: 0.08,
    unlocksZone: null,
    unlocksBoss: null,
    requiredLevel: 90,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BOSS GATE REQUIREMENTS
// Which stones are needed to fight each zone boss
// ─────────────────────────────────────────────────────────────────────────────
export const BOSS_GATE_REQUIREMENTS = {
  // Zone 1 boss: no gate (entry point)
  forest_guardian: { requiredStone: null, requiredCount: 0 },
  // Zone 2 boss: need Forest stone
  desert_wyrm:    { requiredStone: "forest_stone", requiredCount: 1 },
  // Zone 3 boss: need Desert stone
  frost_dragon:   { requiredStone: "desert_stone",  requiredCount: 1 },
  // Zone 4 boss: need Frost stone
  shadow_lord:    { requiredStone: "frost_stone",   requiredCount: 1 },
  // Zone 5 boss: need Shadow stone
  cosmic_overlord:{ requiredStone: "shadow_stone",  requiredCount: 1 },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Check if player can fight a specific boss
export function canFightBoss(bossKey, playerMaterials = []) {
  const req = BOSS_GATE_REQUIREMENTS[bossKey];
  if (!req || !req.requiredStone) return { allowed: true, reason: "" };

  const stone = CELESTIAL_STONES[req.requiredStone];
  const count = playerMaterials.filter(m =>
    m.name === stone.name || m.celestial_stone_id === req.requiredStone
  ).length;

  if (count >= req.requiredCount) {
    return { allowed: true, reason: "" };
  }

  return {
    allowed: false,
    reason: `Requires ${stone.icon} ${stone.name} (${count}/${req.requiredCount})`,
    stone,
  };
}

// Get stone that drops from a specific enemy
export function getStoneDropForEnemy(enemyKey) {
  return Object.values(CELESTIAL_STONES).find(s => s.droppedBy === enemyKey) || null;
}

// Roll for stone drop
export function rollStoneDrop(enemyKey, luck = 0) {
  const stone = getStoneDropForEnemy(enemyKey);
  if (!stone) return null;

  const luckBonus = 1 + Math.min(0.5, luck * 0.003);
  if (Math.random() < stone.dropChance * luckBonus) {
    return stone;
  }
  return null;
}

// Get all stones as material items (for inventory display)
export function getStoneAsMaterial(stoneId) {
  const stone = CELESTIAL_STONES[stoneId];
  if (!stone) return null;
  return {
    name: stone.name,
    type: "material",
    rarity: "mythic",
    is_unique: true,
    celestial_stone_id: stoneId,
    icon: stone.icon,
    description: stone.description,
    stats: {},
  };
}
