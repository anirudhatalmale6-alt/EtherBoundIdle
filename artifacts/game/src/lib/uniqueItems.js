// ===== UNIQUE LEGENDARY ITEMS =====
// Special named items with fixed stats, unique proc effects, and lore.
// These drop from specific bosses/elites and cannot be generated randomly.
// They have the "legendary" or "mythic" rarity but are flagged as unique.

export const UNIQUE_ITEMS = {
  // ── ZONE 1: Verdant Forest ──────────────────────────────────────────────
  heartwood_guardian: {
    id: "heartwood_guardian",
    name: "Heartwood Guardian",
    type: "weapon",
    subtype: "mace",
    rarity: "legendary",
    is_unique: true,
    class_restriction: ["warrior"],
    zone: "verdant_forest",
    dropSource: "forest_guardian",
    dropChance: 0.08,
    level_req: 8,
    item_level: 12,
    stats: { damage: 18, strength: 12, vitality: 15, hp_regen: 1.0, defense: 8 },
    proc_effects: [
      { id: "thorns", chance: 0.25, reflectPercent: 0.30 },
    ],
    lore: "Carved from the heart of an ancient treant, this mace pulses with the life force of the forest.",
    uniqueEffect: "Nature's Wrath: 25% chance to reflect 30% damage taken",
  },

  serpents_kiss: {
    id: "serpents_kiss",
    name: "Serpent's Kiss",
    type: "weapon",
    subtype: "dagger",
    rarity: "legendary",
    is_unique: true,
    class_restriction: ["rogue"],
    zone: "verdant_forest",
    dropSource: "ancient_treant",
    dropChance: 0.06,
    level_req: 8,
    item_level: 12,
    stats: { damage: 14, dexterity: 15, luck: 10, crit_chance: 5, poison_dmg: 15 },
    proc_effects: [
      { id: "poison_cloud", chance: 0.15, damageMultiplier: 0.8, duration: 4 },
    ],
    lore: "The blade weeps a venom that never dries, extracted from the forest's deadliest serpents.",
    uniqueEffect: "Venom Drip: 15% chance to poison for 80% damage over 4 turns",
  },

  // ── ZONE 2: Scorched Desert ─────────────────────────────────────────────
  sunfire_scimitar_unique: {
    id: "sunfire_scimitar_unique",
    name: "Ra's Chosen Blade",
    type: "weapon",
    subtype: "sword",
    rarity: "legendary",
    is_unique: true,
    class_restriction: ["warrior"],
    zone: "scorched_desert",
    dropSource: "desert_wyrm",
    dropChance: 0.06,
    level_req: 20,
    item_level: 28,
    stats: { damage: 45, strength: 35, fire_dmg: 25, crit_chance: 8, attack_speed: 0.1 },
    proc_effects: [
      { id: "fireball_burst", chance: 0.12, damageMultiplier: 2.5 },
    ],
    lore: "Blessed by the sun god himself, this blade burns with an eternal flame.",
    uniqueEffect: "Solar Flare: 12% chance to unleash a 250% fire burst",
  },

  desert_mirage_staff: {
    id: "desert_mirage_staff",
    name: "Mirage Codex",
    type: "weapon",
    subtype: "staff",
    rarity: "legendary",
    is_unique: true,
    class_restriction: ["mage"],
    zone: "scorched_desert",
    dropSource: "fire_colossus",
    dropChance: 0.05,
    level_req: 20,
    item_level: 28,
    stats: { damage: 35, intelligence: 45, sand_dmg: 20, mp_bonus: 40, mp_regen: 1.5 },
    proc_effects: [
      { id: "sand_blast", chance: 0.14, damageMultiplier: 2.0 },
    ],
    lore: "Pages of this codex shift like sand dunes, revealing different spells to different readers.",
    uniqueEffect: "Sandstorm Surge: 14% chance to blast with 200% sand damage",
  },

  scorpion_king_bow: {
    id: "scorpion_king_bow",
    name: "Scorpion King's Recurve",
    type: "weapon",
    subtype: "bow",
    rarity: "legendary",
    is_unique: true,
    class_restriction: ["ranger"],
    zone: "scorched_desert",
    dropSource: "sand_titan",
    dropChance: 0.05,
    level_req: 20,
    item_level: 28,
    stats: { damage: 40, dexterity: 38, poison_dmg: 20, crit_chance: 10, luck: 12 },
    proc_effects: [
      { id: "poison_cloud", chance: 0.18, damageMultiplier: 0.7, duration: 5 },
    ],
    lore: "Strung with the tail sinew of the Scorpion King, each arrow carries his lethal venom.",
    uniqueEffect: "King's Venom: 18% chance to poison for 70% damage over 5 turns",
  },

  // ── ZONE 3: Frozen Peaks ────────────────────────────────────────────────
  frostbite_edge: {
    id: "frostbite_edge",
    name: "Frostbite's Edge",
    type: "weapon",
    subtype: "axe",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["warrior"],
    zone: "frozen_peaks",
    dropSource: "frost_dragon",
    dropChance: 0.04,
    level_req: 38,
    item_level: 48,
    stats: { damage: 85, strength: 70, ice_dmg: 30, crit_chance: 12, defense: 25 },
    proc_effects: [
      { id: "frost_nova", chance: 0.10, damageMultiplier: 2.5 },
      { id: "frozen_shatter", chance: 0.25 },
    ],
    lore: "Forged in the heart of a dying glacier, this axe freezes the very air around it.",
    uniqueEffect: "Permafrost: 10% nova + 25% shatter on crit",
  },

  crystal_heart_staff: {
    id: "crystal_heart_staff",
    name: "Crystal Heart",
    type: "weapon",
    subtype: "staff",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["mage"],
    zone: "frozen_peaks",
    dropSource: "blizzard_titan",
    dropChance: 0.04,
    level_req: 38,
    item_level: 48,
    stats: { damage: 70, intelligence: 85, ice_dmg: 35, mp_bonus: 80, crit_dmg_pct: 15 },
    proc_effects: [
      { id: "frost_nova", chance: 0.12, damageMultiplier: 2.2 },
    ],
    lore: "A crystallized dragon heart mounted on a staff of eternal ice.",
    uniqueEffect: "Dragon's Breath: 12% chance for 220% ice nova",
  },

  // ── ZONE 4: Shadow Realm ────────────────────────────────────────────────
  soulreaver: {
    id: "soulreaver",
    name: "Soulreaver",
    type: "weapon",
    subtype: "blade",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["rogue"],
    zone: "shadow_realm",
    dropSource: "shadow_lord",
    dropChance: 0.03,
    level_req: 60,
    item_level: 75,
    stats: { damage: 130, dexterity: 110, blood_dmg: 35, lifesteal: 12, crit_chance: 18, luck: 30 },
    proc_effects: [
      { id: "blood_drain", chance: 0.10, damageMultiplier: 2.0, healPercent: 0.6 },
      { id: "execute", chance: 0.20, percentMaxHp: 0.10 },
    ],
    lore: "This blade hungers for souls. Each kill makes it stronger, each cut drains life.",
    uniqueEffect: "Soul Siphon: 10% blood drain + 20% execute on crit",
  },

  voidheart_grimoire: {
    id: "voidheart_grimoire",
    name: "Voidheart Grimoire",
    type: "weapon",
    subtype: "staff",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["mage"],
    zone: "shadow_realm",
    dropSource: "void_titan",
    dropChance: 0.03,
    level_req: 60,
    item_level: 75,
    stats: { damage: 110, intelligence: 130, blood_dmg: 30, mp_bonus: 120, mp_regen: 3.0 },
    proc_effects: [
      { id: "blood_drain", chance: 0.08, damageMultiplier: 1.8, healPercent: 0.4 },
      { id: "arcane_surge", every: 3, damageMultiplier: 2.0 },
    ],
    lore: "Written in blood on pages of void-touched parchment, this grimoire speaks in whispers.",
    uniqueEffect: "Void Pulse: blood drain + every 3rd attack deals 200% arcane",
  },

  shadowstep_boots_unique: {
    id: "shadowstep_boots_unique",
    name: "Boots of the Phantom",
    type: "boots",
    rarity: "mythic",
    is_unique: true,
    class_restriction: null,
    zone: "shadow_realm",
    dropSource: "blood_colossus",
    dropChance: 0.04,
    level_req: 55,
    item_level: 70,
    stats: { dexterity: 60, evasion: 8, attack_speed: 0.15, luck: 25 },
    proc_effects: [
      { id: "counter_strike", chance: 0.18, damageMultiplier: 2.0 },
    ],
    lore: "Once belonging to the Phantom King, these boots let you step between shadows.",
    uniqueEffect: "Phantom Step: 18% chance to counter for 200% damage",
  },

  // ── ZONE 5: Celestial Spire ─────────────────────────────────────────────
  godslayer_unique: {
    id: "godslayer_unique",
    name: "Godslayer",
    type: "weapon",
    subtype: "sword",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["warrior"],
    zone: "celestial_spire",
    dropSource: "cosmic_overlord",
    dropChance: 0.02,
    level_req: 85,
    item_level: 105,
    stats: { damage: 250, strength: 200, crit_chance: 20, crit_dmg_pct: 25, fire_dmg: 20, lightning_dmg: 20 },
    proc_effects: [
      { id: "thunder_god", chance: 0.30, damageMultiplier: 4.0 },
      { id: "fireball_burst", chance: 0.15, damageMultiplier: 3.0 },
    ],
    lore: "The blade that slew a god. It crackles with divine power and burns with celestial fire.",
    uniqueEffect: "Divine Wrath: thunder + fire procs on crit",
  },

  genesis_tome: {
    id: "genesis_tome",
    name: "Genesis Tome",
    type: "weapon",
    subtype: "staff",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["mage"],
    zone: "celestial_spire",
    dropSource: "omega_seraph",
    dropChance: 0.02,
    level_req: 85,
    item_level: 105,
    stats: { damage: 200, intelligence: 250, mp_bonus: 200, mp_regen: 5.0, ice_dmg: 25, lightning_dmg: 25 },
    proc_effects: [
      { id: "frost_nova", chance: 0.15, damageMultiplier: 3.0 },
      { id: "lightning_bolt", chance: 0.10, damageMultiplier: 3.5 },
    ],
    lore: "This tome contains the first words ever spoken, capable of reshaping reality.",
    uniqueEffect: "Genesis: frost nova + lightning bolt procs",
  },

  starfall_bow: {
    id: "starfall_bow",
    name: "Starfall",
    type: "weapon",
    subtype: "bow",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["ranger"],
    zone: "celestial_spire",
    dropSource: "celestial_titan",
    dropChance: 0.02,
    level_req: 85,
    item_level: 105,
    stats: { damage: 220, dexterity: 230, crit_chance: 22, luck: 50, fire_dmg: 15, ice_dmg: 15 },
    proc_effects: [
      { id: "triple_strike", every: 4, extraHits: 3 },
      { id: "fireball_burst", chance: 0.12, damageMultiplier: 2.5 },
    ],
    lore: "Arrows fired from this bow fall like meteors from the heavens.",
    uniqueEffect: "Meteor Rain: every 4th attack = 3 bonus hits + fire burst",
  },

  cosmic_kris_unique: {
    id: "cosmic_kris_unique",
    name: "Edge of Oblivion",
    type: "weapon",
    subtype: "blade",
    rarity: "mythic",
    is_unique: true,
    class_restriction: ["rogue"],
    zone: "celestial_spire",
    dropSource: "cosmic_overlord",
    dropChance: 0.02,
    level_req: 85,
    item_level: 105,
    stats: { damage: 210, dexterity: 240, crit_chance: 25, lifesteal: 15, blood_dmg: 30, luck: 40 },
    proc_effects: [
      { id: "execute", chance: 0.25, percentMaxHp: 0.12 },
      { id: "blood_drain", chance: 0.12, damageMultiplier: 2.5, healPercent: 0.6 },
    ],
    lore: "A blade forged at the edge of existence itself, where matter meets the void.",
    uniqueEffect: "Oblivion: 25% execute + 12% blood drain on crit",
  },

  // ── SPECIAL ACCESSORIES ─────────────────────────────────────────────────
  celestial_stone_amulet: {
    id: "celestial_stone_amulet",
    name: "Celestial Stone of Ascension",
    type: "amulet",
    rarity: "mythic",
    is_unique: true,
    class_restriction: null,
    zone: "celestial_spire",
    dropSource: "cosmic_overlord",
    dropChance: 0.03,
    level_req: 80,
    item_level: 100,
    stats: { strength: 80, dexterity: 80, intelligence: 80, vitality: 80, luck: 40, exp_gain_pct: 25, gold_gain_pct: 25 },
    proc_effects: [
      { id: "soul_reap", chance: 0.40, healPercent: 0.20 },
      { id: "exp_surge", chance: 0.25, bonusPercent: 0.50 },
    ],
    lore: "A fragment of the Celestial Spire itself, pulsing with the power of creation.",
    uniqueEffect: "Ascension: 40% heal on kill + 25% bonus EXP",
  },

  ring_of_elements: {
    id: "ring_of_elements",
    name: "Elemental Convergence Ring",
    type: "ring",
    rarity: "mythic",
    is_unique: true,
    class_restriction: null,
    zone: "celestial_spire",
    dropSource: "omega_seraph",
    dropChance: 0.03,
    level_req: 75,
    item_level: 95,
    stats: { fire_dmg: 15, ice_dmg: 15, lightning_dmg: 15, poison_dmg: 15, blood_dmg: 15, sand_dmg: 15, luck: 30 },
    proc_effects: [
      { id: "lightning_bolt", chance: 0.08, damageMultiplier: 2.0 },
      { id: "fireball_burst", chance: 0.08, damageMultiplier: 2.0 },
    ],
    lore: "Six elemental crystals orbit this ring, each one resonating with a different force of nature.",
    uniqueEffect: "Convergence: +15% all elements + dual elemental procs",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Get unique items that can drop from a specific enemy
export function getUniqueDropsForEnemy(enemyKey) {
  return Object.values(UNIQUE_ITEMS).filter(item => item.dropSource === enemyKey);
}

// Get unique items for a specific zone
export function getUniqueItemsForZone(zoneKey) {
  return Object.values(UNIQUE_ITEMS).filter(item => item.zone === zoneKey);
}

// Check if an item name matches a unique item
export function isUniqueItem(itemName) {
  return Object.values(UNIQUE_ITEMS).some(u => u.name === itemName);
}

// Get unique item definition by name
export function getUniqueItemDef(itemName) {
  return Object.values(UNIQUE_ITEMS).find(u => u.name === itemName) || null;
}

// Roll for unique drop from a defeated enemy
export function rollUniqueDrop(enemyKey, characterClass, luck = 0) {
  const possibleDrops = getUniqueDropsForEnemy(enemyKey);
  if (possibleDrops.length === 0) return null;

  // Luck increases drop chance by up to 50%
  const luckBonus = 1 + Math.min(0.5, luck * 0.005);

  for (const item of possibleDrops) {
    // Check class restriction
    if (item.class_restriction && !item.class_restriction.includes(characterClass)) continue;

    const effectiveChance = item.dropChance * luckBonus;
    if (Math.random() < effectiveChance) {
      return item;
    }
  }

  return null;
}
