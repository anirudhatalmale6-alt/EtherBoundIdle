// ===== UNIFIED EQUIPMENT SYSTEM =====
// Single source of truth for all equipment logic, class restrictions, and slot definitions.

// ===== EQUIPMENT SLOTS =====
export const EQUIPMENT_SLOTS = ["weapon", "helmet", "armor", "gloves", "boots", "amulet", "ring"];

export const SLOT_LABELS = {
  weapon: "Weapon",
  helmet: "Helmet",
  armor: "Armor",
  gloves: "Gloves",
  boots: "Boots",
  amulet: "Amulet",
  ring: "Ring",
};

// ===== WEAPON SUBTYPES PER CLASS =====
// Maps class -> allowed weapon subtypes
export const CLASS_WEAPON_SUBTYPES = {
  warrior: ["sword", "axe", "mace"],
  mage:    ["staff", "wand"],
  ranger:  ["bow", "crossbow"],
  rogue:   ["dagger", "blade"],
};

// ===== ARMOR WEIGHT PER CLASS =====
export const CLASS_ARMOR_WEIGHT = {
  warrior: "heavy",
  mage:    "light",
  ranger:  "medium",
  rogue:   "light",
};

export const CLASS_HELMET_WEIGHT = {
  warrior: "plate_helm",
  mage:    "cloth_helm",
  ranger:  "leather_helm",
  rogue:   "cloth_helm",
};

// Armor weight labels for display
export const ARMOR_WEIGHT_LABELS = {
  heavy:  "Heavy Armor",
  medium: "Medium Armor",
  light:  "Light Armor / Robes",
};

// ===== CLASS RESTRICTIONS =====
// Which classes can equip which item subtypes
// "any" means all classes can equip (rings, amulets, boots, helmets are universal)
export const SUBTYPE_CLASS_RESTRICTIONS = {
  // Weapons — class-locked
  sword:     ["warrior"],
  axe:       ["warrior"],
  mace:      ["warrior"],
  staff:     ["mage"],
  wand:      ["mage"],
  bow:       ["ranger"],
  crossbow:  ["ranger"],
  dagger:    ["rogue"],
  blade:     ["rogue"],
  // Armor — by weight
  heavy:     ["warrior"],
  medium:    ["ranger"],
  light:     ["mage", "rogue"],
  // Helmet — by weight (like armor)
  plate_helm:  ["warrior"],
  leather_helm:["ranger"],
  cloth_helm:  ["mage", "rogue"],
  // Universal slots
  ring:      ["warrior", "mage", "ranger", "rogue"],
  amulet:    ["warrior", "mage", "ranger", "rogue"],
  boots:     ["warrior", "mage", "ranger", "rogue"],
  gloves:    ["warrior", "mage", "ranger", "rogue"],
};

// ===== WEAPON SUBTYPE NAMES (for item name pools) =====
export const WEAPON_SUBTYPE_BY_CLASS = {
  warrior: "sword",   // default weapon subtype label for loot generation
  mage:    "staff",
  ranger:  "bow",
  rogue:   "dagger",
};

// ===== CLASS NAMES =====
const CLASS_NAMES = { warrior: "Warrior", mage: "Mage", ranger: "Ranger", rogue: "Rogue" };

// ===== CLASS RESTRICTION CHECK =====
// Returns { allowed: bool, reason: string }
export function canEquipItem(characterClass, item) {
  if (!item) return { allowed: false, reason: "No item" };

  const subtype = item.subtype;
  const type = item.type;

  // Consumables and materials are never equipped
  if (type === "consumable" || type === "material") {
    return { allowed: false, reason: "Cannot equip consumables" };
  }

  // Items with explicit class_restriction array take priority
  if (item.class_restriction && item.class_restriction.length > 0) {
    if (!item.class_restriction.includes(characterClass)) {
      const allowed = item.class_restriction.map(c => CLASS_NAMES[c] || c).join(", ");
      return { allowed: false, reason: `Only usable by: ${allowed}` };
    }
    return { allowed: true, reason: "" };
  }

  // Items with no subtype restriction are universal (rings, amulets, helmets, boots, gloves)
  if (!subtype) {
    return { allowed: true, reason: "" };
  }

  const allowedClasses = SUBTYPE_CLASS_RESTRICTIONS[subtype];
  if (!allowedClasses) return { allowed: true, reason: "" }; // Unknown subtype = universal

  if (!allowedClasses.includes(characterClass)) {
    const allowedNames = allowedClasses.map(c => CLASS_NAMES[c] || c).join(", ");
    return {
      allowed: false,
      reason: `Only usable by: ${allowedNames}`,
    };
  }
  return { allowed: true, reason: "" };
}

// ===== CENTRALIZED EQUIP VALIDATION =====
// Single validation pipeline — ALL equip actions MUST go through this
export function validateEquip(character, item) {
  if (!character || !item) return { valid: false, reason: "Invalid data" };

  // Slot compatibility
  if (!EQUIPMENT_SLOTS.includes(item.type)) {
    return { valid: false, reason: "This item cannot be equipped" };
  }

  // Level requirement
  const levelReq = item.level_req || 1;
  if ((character.level || 1) < levelReq) {
    return { valid: false, reason: `Requires level ${levelReq} (you are level ${character.level})` };
  }

  // Class restriction
  const classCheck = canEquipItem(character.class, item);
  if (!classCheck.allowed) {
    return { valid: false, reason: classCheck.reason };
  }

  return { valid: true, reason: "" };
}

// ===== ALLOWED CLASSES DISPLAY =====
// Returns readable list of classes that can use an item
export function getAllowedClassesLabel(item) {
  if (!item) return "";
  if (item.class_restriction && item.class_restriction.length > 0) {
    return item.class_restriction.map(c => CLASS_NAMES[c] || c).join(", ");
  }
  const subtype = item.subtype;
  if (subtype && SUBTYPE_CLASS_RESTRICTIONS[subtype]) {
    const classes = SUBTYPE_CLASS_RESTRICTIONS[subtype];
    if (classes.length === 4) return "All Classes";
    return classes.map(c => CLASS_NAMES[c] || c).join(", ");
  }
  return "All Classes";
}

// ===== STAT SCALING =====
export const RARITY_STAT_MULTIPLIERS = {
  common:    1.0,
  uncommon:  1.2,
  rare:      1.5,
  epic:      2.0,
  legendary: 2.8,
  mythic:    4.0,
  set:       3.2,
  shiny:     6.0,
};

// ===== SELL PRICE TABLE =====
export const RARITY_SELL_PRICES = {
  common: 8, uncommon: 25, rare: 70, epic: 200, legendary: 600, mythic: 2000, set: 1500, shiny: 8000
};

// ===== STAT POOLS PER ITEM TYPE =====
export const TYPE_STAT_POOLS = {
  weapon:  ["damage", "strength", "dexterity", "intelligence", "crit_chance", "crit_dmg_pct", "attack_speed", "mp_regen"],
  armor:   ["defense", "vitality", "hp_bonus", "strength", "hp_regen", "block_chance", "evasion"],
  helmet:  ["defense", "intelligence", "vitality", "mp_bonus", "mp_regen", "hp_regen"],
  gloves:  ["strength", "dexterity", "crit_chance", "crit_dmg_pct", "attack_speed", "defense"],
  boots:   ["dexterity", "defense", "luck", "evasion", "attack_speed"],
  ring:    ["luck", "strength", "dexterity", "intelligence", "crit_chance", "crit_dmg_pct", "gold_gain_pct", "exp_gain_pct"],
  amulet:  ["vitality", "hp_bonus", "mp_bonus", "luck", "intelligence", "hp_regen", "mp_regen", "block_chance"],
  consumable: ["hp_bonus", "mp_bonus"],
  material:   [],
};

// ===== ITEM STAT GENERATION =====
const PCT_STATS = new Set([
  "crit_chance", "crit_dmg_pct", "evasion", "block_chance",
  "lifesteal", "gold_gain_pct", "exp_gain_pct", "attack_speed"
]);

export function generateItemStats(type, rarity, itemLevel) {
  const pool = TYPE_STAT_POOLS[type] || ["strength"];
  const rarityConfig = {
    common:    { slots: 1, basePerSlot: 0.5 },
    uncommon:  { slots: 2, basePerSlot: 0.55 },
    rare:      { slots: 3, basePerSlot: 0.6 },
    epic:      { slots: 4, basePerSlot: 0.65 },
    legendary: { slots: 5, basePerSlot: 0.75 },
    mythic:    { slots: 6, basePerSlot: 0.85 },
    shiny:     { slots: 7, basePerSlot: 1.0 },
  }[rarity] || { slots: 1, basePerSlot: 0.5 };

  const mult = RARITY_STAT_MULTIPLIERS[rarity] || 1.0;
  const lvlScale = 1 + (itemLevel - 1) * 0.07;
  const stats = {};
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < rarityConfig.slots && i < shuffled.length; i++) {
    const stat = shuffled[i];
    const lifestealsReduction = stat === "lifesteal" ? 0.2 : 1.0;
    const pctReduction = PCT_STATS.has(stat) ? 0.35 : 1.0;
    const base = rarityConfig.basePerSlot * mult * lvlScale * lifestealsReduction * pctReduction;
    const value = Math.max(1, Math.round(base * (0.8 + Math.random() * 0.4)));
    stats[stat] = (stats[stat] || 0) + value;
  }
  return stats;
}

// ===== CENTRALIZED TOTAL STAT CALCULATION =====
// Delegates to statSystem.js — single source of truth
export { calculateTotalStats } from "./statSystem.js";