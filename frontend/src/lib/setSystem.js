// ===== SET ITEM SYSTEM =====
// Defines all item sets, their pieces, and tiered bonuses.
// Set bonuses are applied on top of the normal stat pipeline.

// ───────────────────────────────────────────────────────────────────────────
// SET DEFINITIONS
// Each set: { name, class (null = all), zone, pieces[], bonuses{2,3,5} }
// bonuses keys are number of pieces equipped that trigger the bonus.
// ───────────────────────────────────────────────────────────────────────────
export const ITEM_SETS = {

  // ── ZONE 1: Verdant Forest ─────────────────────────────────────────────
  wildwood: {
    name: "Wildwood Set",
    icon: "🌿",
    class: null, // all classes
    zone: "verdant_forest",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/60",
    glowColor: "shadow-emerald-500/40",
    pieces: ["Wildwood Helm", "Wildwood Chestguard", "Wildwood Gloves", "Wildwood Treads", "Wildwood Amulet"],
    slots:  ["helmet",        "armor",               "gloves",          "boots",          "amulet"],
    bonuses: {
      2: { label: "+15 Vitality, +10 Defense",          stats: { vitality: 15, defense: 10 } },
      3: { label: "+20% HP Regen, +8 Luck",             stats: { hp_bonus: 30, luck: 8 } },
      5: { label: "FULL: +40% Max HP, +25 All Stats",   stats: { hp_bonus: 80, strength: 25, dexterity: 25, intelligence: 25, vitality: 25 } },
    },
  },

  thornblade: {
    name: "Thornblade Set",
    icon: "⚔️",
    class: "warrior",
    zone: "verdant_forest",
    color: "text-green-400",
    borderColor: "border-green-500/60",
    glowColor: "shadow-green-500/40",
    pieces: ["Thornblade Sword", "Thornblade Helm", "Thornblade Chestplate", "Thornblade Gloves", "Thornblade Greaves"],
    slots:  ["weapon",          "helmet",          "armor",               "gloves",            "boots"],
    bonuses: {
      2: { label: "+20 Strength, +15 Defense",           stats: { strength: 20, defense: 15 } },
      3: { label: "+12% Crit Chance, +10 Damage",        stats: { crit_chance: 12, damage: 10 } },
      5: { label: "FULL: +60 Strength, +25% Crit DMG",   stats: { strength: 60, crit_chance: 20, damage: 25 } },
    },
  },

  leafwhisper: {
    name: "Leafwhisper Set",
    icon: "🍃",
    class: "ranger",
    zone: "verdant_forest",
    color: "text-lime-400",
    borderColor: "border-lime-500/60",
    glowColor: "shadow-lime-500/40",
    pieces: ["Leafwhisper Bow", "Leafwhisper Hood", "Leafwhisper Vest", "Leafwhisper Grips", "Leafwhisper Boots"],
    slots:  ["weapon",         "helmet",           "armor",             "gloves",            "boots"],
    bonuses: {
      2: { label: "+25 Dexterity, +10 Luck",              stats: { dexterity: 25, luck: 10 } },
      3: { label: "+15% Attack Speed, +8 Crit Chance",    stats: { crit_chance: 15, dexterity: 10 } },
      5: { label: "FULL: +60 Dexterity, +30% Crit DMG",   stats: { dexterity: 60, crit_chance: 25, luck: 20 } },
    },
  },

  // ── ZONE 2: Scorched Desert ────────────────────────────────────────────
  flamewarden: {
    name: "Flamewarden Set",
    icon: "🔥",
    class: "warrior",
    zone: "scorched_desert",
    color: "text-orange-400",
    borderColor: "border-orange-500/60",
    glowColor: "shadow-orange-500/40",
    pieces: ["Flamewarden Blade", "Flamewarden Helm", "Flamewarden Plate", "Flamewarden Gauntlets", "Flamewarden Greaves"],
    slots:  ["weapon",           "helmet",           "armor",             "gloves",                "boots"],
    bonuses: {
      2: { label: "+30 Strength, +20 Defense",             stats: { strength: 30, defense: 20 } },
      3: { label: "+20 Damage, +20% Max HP",               stats: { damage: 20, hp_bonus: 60 } },
      5: { label: "FULL: +80 Strength, +40 Damage, Burn",  stats: { strength: 80, damage: 40, crit_chance: 15 } },
    },
  },

  desertmystic: {
    name: "Desert Mystic Set",
    icon: "🌞",
    class: "mage",
    zone: "scorched_desert",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/60",
    glowColor: "shadow-yellow-500/40",
    pieces: ["Sun Staff", "Desert Mystic Hood", "Desert Mystic Robe", "Desert Mystic Grips", "Desert Mystic Sandals"],
    slots:  ["weapon",   "helmet",              "armor",              "gloves",              "boots"],
    bonuses: {
      2: { label: "+30 Intelligence, +40 MP",              stats: { intelligence: 30, mp_bonus: 40 } },
      3: { label: "+20% Spell Damage (dmg), +20 Luck",     stats: { damage: 20, luck: 20 } },
      5: { label: "FULL: +80 INT, +80 MP, +50 Damage",     stats: { intelligence: 80, mp_bonus: 80, damage: 50 } },
    },
  },

  sandviper: {
    name: "Sandviper Set",
    icon: "🐍",
    class: "rogue",
    zone: "scorched_desert",
    color: "text-amber-400",
    borderColor: "border-amber-500/60",
    glowColor: "shadow-amber-500/40",
    pieces: ["Sandviper Blade", "Sandviper Hood", "Sandviper Wrap", "Sandviper Grips", "Sandviper Boots"],
    slots:  ["weapon",         "helmet",         "armor",          "gloves",          "boots"],
    bonuses: {
      2: { label: "+30 Dexterity, +15% Crit Chance",      stats: { dexterity: 30, crit_chance: 15 } },
      3: { label: "+8% Lifesteal, +25 Luck",              stats: { lifesteal: 8, luck: 25 } },
      5: { label: "FULL: +70 DEX, +15% Lifesteal, +20 Luck", stats: { dexterity: 70, lifesteal: 15, luck: 20, crit_chance: 20 } },
    },
  },

  // ── ZONE 3: Frozen Peaks ───────────────────────────────────────────────
  glacialveil: {
    name: "Glacial Veil Set",
    icon: "❄️",
    class: null,
    zone: "frozen_peaks",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/60",
    glowColor: "shadow-cyan-500/40",
    pieces: ["Glacial Veil Helm", "Glacial Veil Chest", "Glacial Veil Gloves", "Glacial Veil Boots", "Glacial Veil Ring"],
    slots:  ["helmet",           "armor",              "gloves",              "boots",              "ring"],
    bonuses: {
      2: { label: "+25 Vitality, +30 Defense",             stats: { vitality: 25, defense: 30 } },
      3: { label: "+50 HP Bonus, +15 All Stats",           stats: { hp_bonus: 50, strength: 15, dexterity: 15, intelligence: 15 } },
      5: { label: "FULL: +100 Vitality, +100 Defense",     stats: { vitality: 100, defense: 100, hp_bonus: 150 } },
    },
  },

  froststrike: {
    name: "Froststrike Set",
    icon: "🧊",
    class: "warrior",
    zone: "frozen_peaks",
    color: "text-blue-300",
    borderColor: "border-blue-400/60",
    glowColor: "shadow-blue-400/40",
    pieces: ["Froststrike Axe", "Froststrike Helm", "Froststrike Plate", "Froststrike Gauntlets", "Froststrike Greaves"],
    slots:  ["weapon",         "helmet",           "armor",             "gloves",                "boots"],
    bonuses: {
      2: { label: "+50 Strength, +30 Defense",              stats: { strength: 50, defense: 30 } },
      3: { label: "+35 Damage, +25% Max HP",                stats: { damage: 35, hp_bonus: 80 } },
      5: { label: "FULL: +120 Strength, +70 Damage",        stats: { strength: 120, damage: 70, crit_chance: 20 } },
    },
  },

  arcticspell: {
    name: "Arctic Spell Set",
    icon: "🌨️",
    class: "mage",
    zone: "frozen_peaks",
    color: "text-sky-400",
    borderColor: "border-sky-500/60",
    glowColor: "shadow-sky-500/40",
    pieces: ["Arctic Spell Staff", "Arctic Spell Crown", "Arctic Spell Robe", "Arctic Spell Gloves", "Arctic Spell Boots"],
    slots:  ["weapon",            "helmet",             "armor",             "gloves",              "boots"],
    bonuses: {
      2: { label: "+60 Intelligence, +50 MP",              stats: { intelligence: 60, mp_bonus: 50 } },
      3: { label: "+40 Damage, +30 Luck",                   stats: { damage: 40, luck: 30 } },
      5: { label: "FULL: +150 INT, +100 MP, +80 Damage",    stats: { intelligence: 150, mp_bonus: 100, damage: 80 } },
    },
  },

  // ── ZONE 4: Shadow Realm ───────────────────────────────────────────────
  voidreaper: {
    name: "Void Reaper Set",
    icon: "💀",
    class: "rogue",
    zone: "shadow_realm",
    color: "text-purple-400",
    borderColor: "border-purple-500/60",
    glowColor: "shadow-purple-500/40",
    pieces: ["Void Reaper Blade", "Void Reaper Hood", "Void Reaper Wrap", "Void Reaper Grips", "Void Reaper Treads"],
    slots:  ["weapon",           "helmet",           "armor",            "gloves",            "boots"],
    bonuses: {
      2: { label: "+60 Dexterity, +25% Crit Chance",       stats: { dexterity: 60, crit_chance: 25 } },
      3: { label: "+15% Lifesteal, +50 Luck",              stats: { lifesteal: 15, luck: 50 } },
      5: { label: "FULL: +150 DEX, +25% Lifesteal, God Crit", stats: { dexterity: 150, lifesteal: 25, luck: 60, crit_chance: 30 } },
    },
  },

  shadowlord: {
    name: "Shadowlord Set",
    icon: "🌑",
    class: "warrior",
    zone: "shadow_realm",
    color: "text-slate-400",
    borderColor: "border-slate-400/60",
    glowColor: "shadow-slate-400/40",
    pieces: ["Shadowlord Greatblade", "Shadowlord Helm", "Shadowlord Plate", "Shadowlord Gauntlets", "Shadowlord Greaves"],
    slots:  ["weapon",              "helmet",          "armor",              "gloves",               "boots"],
    bonuses: {
      2: { label: "+80 Strength, +50 Defense",              stats: { strength: 80, defense: 50 } },
      3: { label: "+60 Damage, +40% Max HP",                stats: { damage: 60, hp_bonus: 150 } },
      5: { label: "FULL: +200 Strength, +120 Damage",       stats: { strength: 200, damage: 120, crit_chance: 25, defense: 80 } },
    },
  },

  voidweaver: {
    name: "Void Weaver Set",
    icon: "🔮",
    class: "mage",
    zone: "shadow_realm",
    color: "text-violet-400",
    borderColor: "border-violet-500/60",
    glowColor: "shadow-violet-500/40",
    pieces: ["Void Weaver Staff", "Void Weaver Crown", "Void Weaver Robe", "Void Weaver Gloves", "Void Weaver Boots"],
    slots:  ["weapon",           "helmet",            "armor",             "gloves",             "boots"],
    bonuses: {
      2: { label: "+100 Intelligence, +80 MP",             stats: { intelligence: 100, mp_bonus: 80 } },
      3: { label: "+80 Damage, +60 Luck",                   stats: { damage: 80, luck: 60 } },
      5: { label: "FULL: +250 INT, +200 MP, +150 Damage",   stats: { intelligence: 250, mp_bonus: 200, damage: 150 } },
    },
  },

  // ── ZONE 5: Celestial Spire (endgame) ─────────────────────────────────
  cosmicguardian: {
    name: "Cosmic Guardian Set",
    icon: "✨",
    class: null,
    zone: "celestial_spire",
    color: "text-yellow-300",
    borderColor: "border-yellow-400/70",
    glowColor: "shadow-yellow-400/50",
    pieces: ["Cosmic Guardian Crown", "Cosmic Guardian Plate", "Cosmic Guardian Gauntlets", "Cosmic Guardian Greaves", "Cosmic Guardian Amulet"],
    slots:  ["helmet",               "armor",                 "gloves",                   "boots",                  "amulet"],
    bonuses: {
      2: { label: "+100 All Primary Stats",                stats: { strength: 100, dexterity: 100, intelligence: 100, vitality: 100 } },
      3: { label: "+200 HP/MP, +50 Defense",               stats: { hp_bonus: 200, mp_bonus: 200, defense: 50 } },
      5: { label: "FULL: GODLIKE — +300 All, +200 DMG",    stats: { strength: 300, dexterity: 300, intelligence: 300, vitality: 300, damage: 200, defense: 200 } },
    },
  },

  starbornslayer: {
    name: "Starborn Slayer Set",
    icon: "⭐",
    class: "warrior",
    zone: "celestial_spire",
    color: "text-amber-300",
    borderColor: "border-amber-400/70",
    glowColor: "shadow-amber-400/50",
    pieces: ["Starblade", "Starborn Crown", "Starborn Plate", "Starborn Gauntlets", "Starborn Greaves"],
    slots:  ["weapon",    "helmet",         "armor",          "gloves",             "boots"],
    bonuses: {
      2: { label: "+150 Strength, +100 Defense",             stats: { strength: 150, defense: 100 } },
      3: { label: "+100 Damage, +30% Crit Chance",           stats: { damage: 100, crit_chance: 30 } },
      5: { label: "FULL: +400 Strength, +250 Damage, MAX CRIT", stats: { strength: 400, damage: 250, crit_chance: 40, defense: 200 } },
    },
  },

  celestialarchmage: {
    name: "Celestial Archmage Set",
    icon: "🌌",
    class: "mage",
    zone: "celestial_spire",
    color: "text-blue-200",
    borderColor: "border-blue-300/70",
    glowColor: "shadow-blue-300/50",
    pieces: ["Genesis Staff", "Celestial Crown", "Celestial Vestments", "Celestial Gloves", "Celestial Sabatons"],
    slots:  ["weapon",        "helmet",          "armor",               "gloves",           "boots"],
    bonuses: {
      2: { label: "+200 Intelligence, +150 MP",              stats: { intelligence: 200, mp_bonus: 150 } },
      3: { label: "+150 Damage, +100 Luck",                   stats: { damage: 150, luck: 100 } },
      5: { label: "FULL: +500 INT, +400 MP, +300 Damage",     stats: { intelligence: 500, mp_bonus: 400, damage: 300 } },
    },
  },

  novastriker: {
    name: "Nova Striker Set",
    icon: "💫",
    class: "ranger",
    zone: "celestial_spire",
    color: "text-green-300",
    borderColor: "border-green-400/70",
    glowColor: "shadow-green-400/50",
    pieces: ["Nova Recurve", "Nova Hood", "Nova Vest", "Nova Grips", "Nova Treads"],
    slots:  ["weapon",       "helmet",   "armor",     "gloves",     "boots"],
    bonuses: {
      2: { label: "+200 Dexterity, +80 Luck",               stats: { dexterity: 200, luck: 80 } },
      3: { label: "+35% Crit Chance, +120 Damage",           stats: { crit_chance: 35, damage: 120 } },
      5: { label: "FULL: +500 DEX, +35% Crit, +300 DMG",    stats: { dexterity: 500, crit_chance: 35, damage: 300, luck: 150 } },
    },
  },

  voidassassin: {
    name: "Void Assassin Set",
    icon: "🗡️",
    class: "rogue",
    zone: "celestial_spire",
    color: "text-rose-400",
    borderColor: "border-rose-500/70",
    glowColor: "shadow-rose-500/50",
    pieces: ["Cosmic Kris", "Void Assassin Hood", "Void Assassin Wrap", "Void Assassin Grips", "Void Assassin Boots"],
    slots:  ["weapon",      "helmet",             "armor",              "gloves",              "boots"],
    bonuses: {
      2: { label: "+250 Dexterity, +35% Crit Chance",        stats: { dexterity: 250, crit_chance: 35 } },
      3: { label: "+25% Lifesteal, +150 Luck",               stats: { lifesteal: 25, luck: 150 } },
      5: { label: "FULL: +600 DEX, +40% Lifesteal, GODCRIT", stats: { dexterity: 600, lifesteal: 40, luck: 200, crit_chance: 40, damage: 200 } },
    },
  },
};

// ───────────────────────────────────────────────────────────────────────────
// LOOKUP: given an item name, find which set it belongs to and which slot
// ───────────────────────────────────────────────────────────────────────────
export function getItemSetInfo(itemName) {
  for (const [setKey, set] of Object.entries(ITEM_SETS)) {
    const idx = set.pieces.indexOf(itemName);
    if (idx !== -1) {
      return { setKey, set, slotIndex: idx };
    }
  }
  return null;
}

// ───────────────────────────────────────────────────────────────────────────
// CALCULATE ACTIVE SET BONUSES
// Given list of currently equipped items, returns active bonuses per set
// Returns: { [setKey]: { set, equippedCount, pieces, activeBonuses } }
// ───────────────────────────────────────────────────────────────────────────
export function calculateSetBonuses(equippedItems) {
  const result = {};

  for (const [setKey, set] of Object.entries(ITEM_SETS)) {
    const equippedPieces = equippedItems.filter(item => set.pieces.includes(item.name));
    const count = equippedPieces.length;
    if (count === 0) continue;

    // Find which tier bonuses are active
    const activeBonuses = [];
    const thresholds = Object.keys(set.bonuses).map(Number).sort((a, b) => a - b);
    for (const threshold of thresholds) {
      if (count >= threshold) {
        activeBonuses.push({ threshold, ...set.bonuses[threshold] });
      }
    }

    result[setKey] = {
      set,
      equippedCount: count,
      totalPieces: set.pieces.length,
      equippedPieces: equippedPieces.map(i => i.name),
      activeBonuses,
    };
  }

  return result;
}

// ───────────────────────────────────────────────────────────────────────────
// AGGREGATE SET BONUS STATS
// Returns a flat stats object combining all active set bonuses
// ───────────────────────────────────────────────────────────────────────────
export function aggregateSetStats(equippedItems) {
  const setBonuses = calculateSetBonuses(equippedItems);
  const combined = {};

  for (const { activeBonuses } of Object.values(setBonuses)) {
    for (const bonus of activeBonuses) {
      if (!bonus.stats) continue;
      for (const [k, v] of Object.entries(bonus.stats)) {
        combined[k] = (combined[k] || 0) + v;
      }
    }
  }

  return combined;
}

// ───────────────────────────────────────────────────────────────────────────
// SET ITEM NAMES — for loot generation (flat list for quick lookup)
// ───────────────────────────────────────────────────────────────────────────
export const ALL_SET_PIECE_NAMES = new Set(
  Object.values(ITEM_SETS).flatMap(s => s.pieces)
);

// Map: itemName -> setKey
export const ITEM_NAME_TO_SET = {};
for (const [setKey, set] of Object.entries(ITEM_SETS)) {
  for (const pieceName of set.pieces) {
    ITEM_NAME_TO_SET[pieceName] = setKey;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// SET LOOT TABLES per zone and class
// Each entry: [name, slot, class (null=all)]
// ───────────────────────────────────────────────────────────────────────────
export const ZONE_SET_DROPS = {
  verdant_forest: [
    // Wildwood (all classes)
    { name: "Wildwood Helm",        slot: "helmet", class: null,     setKey: "wildwood" },
    { name: "Wildwood Chestguard",  slot: "armor",  class: null,     setKey: "wildwood" },
    { name: "Wildwood Gloves",      slot: "gloves", class: null,     setKey: "wildwood" },
    { name: "Wildwood Treads",      slot: "boots",  class: null,     setKey: "wildwood" },
    { name: "Wildwood Amulet",      slot: "amulet", class: null,     setKey: "wildwood" },
    // Thornblade (warrior)
    { name: "Thornblade Sword",     slot: "weapon", class: "warrior", setKey: "thornblade" },
    { name: "Thornblade Helm",      slot: "helmet", class: "warrior", setKey: "thornblade" },
    { name: "Thornblade Chestplate",slot: "armor",  class: "warrior", setKey: "thornblade" },
    { name: "Thornblade Gloves",    slot: "gloves", class: "warrior", setKey: "thornblade" },
    { name: "Thornblade Greaves",   slot: "boots",  class: "warrior", setKey: "thornblade" },
    // Leafwhisper (ranger)
    { name: "Leafwhisper Bow",      slot: "weapon", class: "ranger",  setKey: "leafwhisper" },
    { name: "Leafwhisper Hood",     slot: "helmet", class: "ranger",  setKey: "leafwhisper" },
    { name: "Leafwhisper Vest",     slot: "armor",  class: "ranger",  setKey: "leafwhisper" },
    { name: "Leafwhisper Grips",    slot: "gloves", class: "ranger",  setKey: "leafwhisper" },
    { name: "Leafwhisper Boots",    slot: "boots",  class: "ranger",  setKey: "leafwhisper" },
  ],
  scorched_desert: [
    { name: "Flamewarden Blade",     slot: "weapon", class: "warrior", setKey: "flamewarden" },
    { name: "Flamewarden Helm",      slot: "helmet", class: "warrior", setKey: "flamewarden" },
    { name: "Flamewarden Plate",     slot: "armor",  class: "warrior", setKey: "flamewarden" },
    { name: "Flamewarden Gauntlets", slot: "gloves", class: "warrior", setKey: "flamewarden" },
    { name: "Flamewarden Greaves",   slot: "boots",  class: "warrior", setKey: "flamewarden" },
    { name: "Sun Staff",             slot: "weapon", class: "mage",    setKey: "desertmystic" },
    { name: "Desert Mystic Hood",    slot: "helmet", class: "mage",    setKey: "desertmystic" },
    { name: "Desert Mystic Robe",    slot: "armor",  class: "mage",    setKey: "desertmystic" },
    { name: "Desert Mystic Grips",   slot: "gloves", class: "mage",    setKey: "desertmystic" },
    { name: "Desert Mystic Sandals", slot: "boots",  class: "mage",    setKey: "desertmystic" },
    { name: "Sandviper Blade",       slot: "weapon", class: "rogue",   setKey: "sandviper" },
    { name: "Sandviper Hood",        slot: "helmet", class: "rogue",   setKey: "sandviper" },
    { name: "Sandviper Wrap",        slot: "armor",  class: "rogue",   setKey: "sandviper" },
    { name: "Sandviper Grips",       slot: "gloves", class: "rogue",   setKey: "sandviper" },
    { name: "Sandviper Boots",       slot: "boots",  class: "rogue",   setKey: "sandviper" },
  ],
  frozen_peaks: [
    { name: "Glacial Veil Helm",    slot: "helmet", class: null,      setKey: "glacialveil" },
    { name: "Glacial Veil Chest",   slot: "armor",  class: null,      setKey: "glacialveil" },
    { name: "Glacial Veil Gloves",  slot: "gloves", class: null,      setKey: "glacialveil" },
    { name: "Glacial Veil Boots",   slot: "boots",  class: null,      setKey: "glacialveil" },
    { name: "Glacial Veil Ring",    slot: "ring",   class: null,      setKey: "glacialveil" },
    { name: "Froststrike Axe",      slot: "weapon", class: "warrior", setKey: "froststrike" },
    { name: "Froststrike Helm",     slot: "helmet", class: "warrior", setKey: "froststrike" },
    { name: "Froststrike Plate",    slot: "armor",  class: "warrior", setKey: "froststrike" },
    { name: "Froststrike Gauntlets",slot: "gloves", class: "warrior", setKey: "froststrike" },
    { name: "Froststrike Greaves",  slot: "boots",  class: "warrior", setKey: "froststrike" },
    { name: "Arctic Spell Staff",   slot: "weapon", class: "mage",    setKey: "arcticspell" },
    { name: "Arctic Spell Crown",   slot: "helmet", class: "mage",    setKey: "arcticspell" },
    { name: "Arctic Spell Robe",    slot: "armor",  class: "mage",    setKey: "arcticspell" },
    { name: "Arctic Spell Gloves",  slot: "gloves", class: "mage",    setKey: "arcticspell" },
    { name: "Arctic Spell Boots",   slot: "boots",  class: "mage",    setKey: "arcticspell" },
  ],
  shadow_realm: [
    { name: "Void Reaper Blade",    slot: "weapon", class: "rogue",   setKey: "voidreaper" },
    { name: "Void Reaper Hood",     slot: "helmet", class: "rogue",   setKey: "voidreaper" },
    { name: "Void Reaper Wrap",     slot: "armor",  class: "rogue",   setKey: "voidreaper" },
    { name: "Void Reaper Grips",    slot: "gloves", class: "rogue",   setKey: "voidreaper" },
    { name: "Void Reaper Treads",   slot: "boots",  class: "rogue",   setKey: "voidreaper" },
    { name: "Shadowlord Greatblade",slot: "weapon", class: "warrior", setKey: "shadowlord" },
    { name: "Shadowlord Helm",      slot: "helmet", class: "warrior", setKey: "shadowlord" },
    { name: "Shadowlord Plate",     slot: "armor",  class: "warrior", setKey: "shadowlord" },
    { name: "Shadowlord Gauntlets", slot: "gloves", class: "warrior", setKey: "shadowlord" },
    { name: "Shadowlord Greaves",   slot: "boots",  class: "warrior", setKey: "shadowlord" },
    { name: "Void Weaver Staff",    slot: "weapon", class: "mage",    setKey: "voidweaver" },
    { name: "Void Weaver Crown",    slot: "helmet", class: "mage",    setKey: "voidweaver" },
    { name: "Void Weaver Robe",     slot: "armor",  class: "mage",    setKey: "voidweaver" },
    { name: "Void Weaver Gloves",   slot: "gloves", class: "mage",    setKey: "voidweaver" },
    { name: "Void Weaver Boots",    slot: "boots",  class: "mage",    setKey: "voidweaver" },
  ],
  celestial_spire: [
    { name: "Cosmic Guardian Crown",     slot: "helmet", class: null,      setKey: "cosmicguardian" },
    { name: "Cosmic Guardian Plate",     slot: "armor",  class: null,      setKey: "cosmicguardian" },
    { name: "Cosmic Guardian Gauntlets", slot: "gloves", class: null,      setKey: "cosmicguardian" },
    { name: "Cosmic Guardian Greaves",   slot: "boots",  class: null,      setKey: "cosmicguardian" },
    { name: "Cosmic Guardian Amulet",    slot: "amulet", class: null,      setKey: "cosmicguardian" },
    { name: "Starblade",                 slot: "weapon", class: "warrior", setKey: "starbornslayer" },
    { name: "Starborn Crown",            slot: "helmet", class: "warrior", setKey: "starbornslayer" },
    { name: "Starborn Plate",            slot: "armor",  class: "warrior", setKey: "starbornslayer" },
    { name: "Starborn Gauntlets",        slot: "gloves", class: "warrior", setKey: "starbornslayer" },
    { name: "Starborn Greaves",          slot: "boots",  class: "warrior", setKey: "starbornslayer" },
    { name: "Genesis Staff",             slot: "weapon", class: "mage",    setKey: "celestialarchmage" },
    { name: "Celestial Crown",           slot: "helmet", class: "mage",    setKey: "celestialarchmage" },
    { name: "Celestial Vestments",       slot: "armor",  class: "mage",    setKey: "celestialarchmage" },
    { name: "Celestial Gloves",          slot: "gloves", class: "mage",    setKey: "celestialarchmage" },
    { name: "Celestial Sabatons",        slot: "boots",  class: "mage",    setKey: "celestialarchmage" },
    { name: "Nova Recurve",              slot: "weapon", class: "ranger",  setKey: "novastriker" },
    { name: "Nova Hood",                 slot: "helmet", class: "ranger",  setKey: "novastriker" },
    { name: "Nova Vest",                 slot: "armor",  class: "ranger",  setKey: "novastriker" },
    { name: "Nova Grips",                slot: "gloves", class: "ranger",  setKey: "novastriker" },
    { name: "Nova Treads",               slot: "boots",  class: "ranger",  setKey: "novastriker" },
    { name: "Cosmic Kris",               slot: "weapon", class: "rogue",   setKey: "voidassassin" },
    { name: "Void Assassin Hood",        slot: "helmet", class: "rogue",   setKey: "voidassassin" },
    { name: "Void Assassin Wrap",        slot: "armor",  class: "rogue",   setKey: "voidassassin" },
    { name: "Void Assassin Grips",       slot: "gloves", class: "rogue",   setKey: "voidassassin" },
    { name: "Void Assassin Boots",       slot: "boots",  class: "rogue",   setKey: "voidassassin" },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// GENERATE SET ITEM STATS based on zone + rarity
// Set items use fixed stat distributions appropriate for their set bonus theme
// ───────────────────────────────────────────────────────────────────────────
const ZONE_ITEM_LEVEL = {
  verdant_forest:  { base: 8,  range: 8 },
  scorched_desert: { base: 22, range: 10 },
  frozen_peaks:    { base: 38, range: 12 },
  shadow_realm:    { base: 58, range: 14 },
  celestial_spire: { base: 80, range: 18 },
};

const SET_STAT_THEMES = {
  // tankset
  wildwood:          { hp_bonus: 3, defense: 2, vitality: 2, strength: 1 },
  glacialveil:       { defense: 3, vitality: 3, hp_bonus: 2, strength: 1 },
  cosmicguardian:    { hp_bonus: 4, mp_bonus: 4, defense: 3, vitality: 3, strength: 2, dexterity: 2, intelligence: 2 },
  // warrior sets
  thornblade:        { strength: 3, damage: 3, defense: 2, crit_chance: 1 },
  flamewarden:       { strength: 4, damage: 3, defense: 3, hp_bonus: 2 },
  froststrike:       { strength: 5, damage: 4, defense: 4, hp_bonus: 3 },
  shadowlord:        { strength: 6, damage: 5, defense: 5, hp_bonus: 4 },
  starbornslayer:    { strength: 8, damage: 7, defense: 6, crit_chance: 3 },
  // mage sets
  desertmystic:      { intelligence: 4, mp_bonus: 3, damage: 3, luck: 1 },
  arcticspell:       { intelligence: 5, mp_bonus: 4, damage: 4, luck: 2 },
  voidweaver:        { intelligence: 6, mp_bonus: 5, damage: 5, luck: 3 },
  celestialarchmage: { intelligence: 8, mp_bonus: 7, damage: 6, luck: 4 },
  // ranger sets
  leafwhisper:       { dexterity: 3, luck: 2, crit_chance: 2, damage: 1 },
  novastriker:       { dexterity: 8, luck: 5, crit_chance: 4, damage: 5 },
  // rogue sets
  sandviper:         { dexterity: 4, luck: 3, crit_chance: 3, lifesteal: 1 },
  voidreaper:        { dexterity: 6, luck: 4, crit_chance: 4, lifesteal: 2 },
  voidassassin:      { dexterity: 8, luck: 6, crit_chance: 5, lifesteal: 3, damage: 4 },
};

export function generateSetItemStats(setKey, slot, zone) {
  const theme = SET_STAT_THEMES[setKey] || { strength: 2, defense: 2 };
  const lvlConfig = ZONE_ITEM_LEVEL[zone] || { base: 10, range: 5 };
  const itemLevel = lvlConfig.base + Math.floor(Math.random() * lvlConfig.range);
  const scale = 1 + (itemLevel - 1) * 0.10;

  const stats = {};
  for (const [stat, weight] of Object.entries(theme)) {
    const base = weight * scale;
    stats[stat] = Math.max(1, Math.round(base * (0.85 + Math.random() * 0.3)));
  }

  // Weapons always get damage
  if (slot === "weapon" && !stats.damage) stats.damage = Math.round(5 * scale);

  const levelBase = ZONE_ITEM_LEVEL[zone]?.base || 5;
  return { stats, itemLevel, levelReq: Math.max(1, levelBase - 3) };
}