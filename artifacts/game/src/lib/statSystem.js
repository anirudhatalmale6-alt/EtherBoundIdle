// ===== UNIFIED MMORPG STAT SYSTEM =====
// Single source of truth for ALL stat calculations.
// DO NOT duplicate any formulas anywhere else.

// ─────────────────────────────────────────────────────────────────────────────
// BASE CLASS VALUES
// ─────────────────────────────────────────────────────────────────────────────
export const CLASS_BASE_HP = { warrior: 120, mage: 70, ranger: 90, rogue: 80 };
export const CLASS_BASE_MP = { warrior: 30,  mage: 80, ranger: 50, rogue: 50 };
export const HP_PER_LEVEL  = { warrior: 12,  mage: 6,  ranger: 8,  rogue: 7  };
export const MP_PER_LEVEL  = { warrior: 2,   mage: 8,  ranger: 4,  rogue: 4  };

// ─────────────────────────────────────────────────────────────────────────────
// SCALING CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
export const VIT_TO_HP       = 15;   // 1 VIT → +15 max HP
export const INT_TO_MP       = 5;    // 1 INT → +5 max MP

// HP Regen: base + VIT contribution
// Regen is intentionally low so it's sustain, not immortality
const VIT_TO_HP_REGEN   = 0.05;  // 1 VIT  → +0.05 HP/s   (at 50 VIT = +2.5 HP/s)
const INT_TO_MP_REGEN   = 0.04;  // 1 INT  → +0.04 MP/s   (at 50 INT = +2.0 MP/s)
const BASE_HP_REGEN     = 0.5;   // everyone starts with 0.5 HP/s
const BASE_MP_REGEN     = 0.5;   // everyone starts with 0.5 MP/s

// Evasion: DEX-based, slow scaling, hard cap
const EVASION_DEX_RATE  = 0.10;  // 1 DEX → +0.10% evasion (50 DEX = 5%)
const EVASION_SOFT_CAP  = 20;    // diminishing returns after 20%
const EVASION_HARD_CAP  = 40;    // absolute max 40%

// Block: primarily from equipment, minor VIT/STR contribution
const BLOCK_STR_RATE    = 0.03;  // 1 STR → +0.03% block
const BLOCK_VIT_RATE    = 0.03;  // 1 VIT → +0.03% block
const BLOCK_HARD_CAP    = 50;    // max 50%
const BLOCK_DAMAGE_REDUCTION = 0.60; // blocking reduces damage by 60%

// ─────────────────────────────────────────────────────────────────────────────
// ATTACK SPEED & CRIT DMG SCALING
// ─────────────────────────────────────────────────────────────────────────────
// attack_speed: base 1.0, DEX adds a small bonus, gear can push higher
// crit_dmg_pct: base 150% (1.5x), each point of crit_dmg_pct stat = +1%
export const BASE_ATTACK_SPEED    = 1.0;
export const DEX_ATTACK_SPEED     = 0.002;  // 50 DEX = +0.10 speed (reduced)
export const ATTACK_SPEED_CAP     = 2.0;    // max 2x base speed (reduced from 3x)
export const BASE_CRIT_DMG_PCT    = 125;    // 125% = 1.25x multiplier on crit (reduced from 150%)
export const CRIT_DMG_LUK_RATE    = 0.15;   // 1 LUK → +0.15% crit dmg (reduced from 0.3%)
export const CRIT_DMG_CAP         = 175;    // max 175% (reduced from 400%)

// ─────────────────────────────────────────────────────────────────────────────
// DAMAGE SCALING
// ─────────────────────────────────────────────────────────────────────────────
export const CLASS_DAMAGE_SCALING = {
  warrior: { primary: "strength",     primaryMult: 1.5, secondary: "vitality",     secondaryMult: 0.0 },
  mage:    { primary: "intelligence", primaryMult: 1.6, secondary: "strength",     secondaryMult: 0.0 },
  ranger:  { primary: "dexterity",    primaryMult: 1.4, secondary: "strength",     secondaryMult: 0.15 },
  rogue:   { primary: "dexterity",    primaryMult: 1.4, secondary: "strength",     secondaryMult: 0.3 },
};

// ─────────────────────────────────────────────────────────────────────────────
// CRIT SCALING
// ─────────────────────────────────────────────────────────────────────────────
export const CRIT_BASE      = 2;
export const CRIT_DEX_RATE  = 0.05;
export const CRIT_LUK_RATE  = 0.08;
export const CRIT_SOFT_CAP  = 30;
export const CRIT_HARD_CAP  = 50;

function calcCritChance(dex, luck) {
  const raw = CRIT_BASE + dex * CRIT_DEX_RATE + luck * CRIT_LUK_RATE;
  if (raw <= CRIT_SOFT_CAP) return raw;
  const overflow = raw - CRIT_SOFT_CAP;
  return Math.min(CRIT_HARD_CAP, CRIT_SOFT_CAP + overflow * 0.4);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFENSE SCALING
// ─────────────────────────────────────────────────────────────────────────────
function calcDefenseReduction(defense) {
  return defense / (defense + 100); // 0..1 soft curve
}

// ─────────────────────────────────────────────────────────────────────────────
// EVASION SCALING  (diminishing returns above soft cap)
// ─────────────────────────────────────────────────────────────────────────────
function calcEvasion(dex, bonusEvasion = 0) {
  const raw = dex * EVASION_DEX_RATE + bonusEvasion;
  let evasion;
  if (raw <= EVASION_SOFT_CAP) {
    evasion = raw;
  } else {
    const overflow = raw - EVASION_SOFT_CAP;
    evasion = EVASION_SOFT_CAP + overflow * 0.3;
  }
  return Math.min(EVASION_HARD_CAP, evasion);
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK SCALING
// ─────────────────────────────────────────────────────────────────────────────
function calcBlockChance(str, vit, bonusBlock = 0) {
  const raw = str * BLOCK_STR_RATE + vit * BLOCK_VIT_RATE + bonusBlock;
  return Math.min(BLOCK_HARD_CAP, raw);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * calculateFinalStats(character, equippedItems, extraSetStats?)
 *
 * Returns: { base, equipBonus, setBonus, total, derived }
 *
 * derived includes ALL combat-ready values:
 *   attackPower, rawDefense, damageReduction, maxHp, maxMp,
 *   critChance, lifesteal,
 *   hpRegen, mpRegen,
 *   evasion, blockChance, blockReduction,
 *   goldGainPct, expGainPct
 */
export function calculateFinalStats(character, equippedItems = [], extraSetStats = null) {
  const cls   = character.class || "warrior";
  const level = character.level || 1;

  // ── 1. Base Stats (stored on character, already include allocated points) ──
  const base = {
    strength:     character.strength     || 10,
    dexterity:    character.dexterity    || 10,
    intelligence: character.intelligence || 10,
    vitality:     character.vitality     || 10,
    luck:         character.luck         || 5,
    // direct combat mods (from items / bonuses)
    damage:       0,
    defense:      0,
    hp_bonus:     0,
    mp_bonus:     0,
    crit_chance:  0,
    lifesteal:    0,
    hp_regen:     0,
    mp_regen:     0,
    evasion:      0,
    block_chance: 0,
    gold_gain_pct: 0,
    exp_gain_pct:  0,
    attack_speed:  0,
    crit_dmg_pct:  0,
    // Elemental damage bonuses (%)
    fire_dmg:      0,
    ice_dmg:       0,
    lightning_dmg: 0,
    poison_dmg:    0,
    blood_dmg:     0,
    sand_dmg:      0,
  };

  // ── 2. Equipment Bonus ────────────────────────────────────────────────────
  const BONUS_KEYS = Object.keys(base);
  const equipBonus = Object.fromEntries(BONUS_KEYS.map(k => [k, 0]));
  for (const item of equippedItems) {
    if (!item.stats) continue;
    for (const [k, v] of Object.entries(item.stats)) {
      if (k in equipBonus) equipBonus[k] += v || 0;
    }
  }

  // ── 3. Set Bonus ──────────────────────────────────────────────────────────
  const setBonus = Object.fromEntries(BONUS_KEYS.map(k => [k, 0]));
  if (extraSetStats) {
    for (const [k, v] of Object.entries(extraSetStats)) {
      if (k in setBonus) setBonus[k] += v || 0;
    }
  }

  // ── 4. Total ──────────────────────────────────────────────────────────────
  const total = {};
  for (const k of BONUS_KEYS) {
    total[k] = base[k] + equipBonus[k] + setBonus[k];
  }

  // ── 5. Derived Combat Values ──────────────────────────────────────────────
  const scaling   = CLASS_DAMAGE_SCALING[cls] || CLASS_DAMAGE_SCALING.warrior;
  const attackPower = Math.round(
    total[scaling.primary] * scaling.primaryMult +
    total[scaling.secondary] * scaling.secondaryMult +
    total.damage
  );

  const rawDefense      = total.vitality * 0.3 + total.defense;
  const damageReduction = calcDefenseReduction(rawDefense); // 0..1

  const classBaseHp    = CLASS_BASE_HP[cls] || 100;
  const classHpPerLevel = HP_PER_LEVEL[cls] || 8;
  const maxHp = Math.round(
    classBaseHp + (level - 1) * classHpPerLevel +
    total.vitality * VIT_TO_HP + total.hp_bonus
  );

  const classBaseMp    = CLASS_BASE_MP[cls] || 50;
  const classMpPerLevel = MP_PER_LEVEL[cls] || 4;
  const maxMp = Math.round(
    classBaseMp + (level - 1) * classMpPerLevel +
    total.intelligence * INT_TO_MP + total.mp_bonus
  );

  const critChance = parseFloat(
    calcCritChance(total.dexterity, total.luck + total.crit_chance).toFixed(1)
  );

  // HP Regen: base + VIT scaling + item/set bonus
  const hpRegen = parseFloat(
    (BASE_HP_REGEN + total.vitality * VIT_TO_HP_REGEN + total.hp_regen).toFixed(2)
  );

  // MP Regen: base + INT scaling + item/set bonus
  const mpRegen = parseFloat(
    (BASE_MP_REGEN + total.intelligence * INT_TO_MP_REGEN + total.mp_regen).toFixed(2)
  );

  // Evasion: DEX-based + bonus
  const evasion = parseFloat(
    calcEvasion(total.dexterity, total.evasion).toFixed(1)
  );

  // Block: STR+VIT base + equipment bonus
  const blockChance = parseFloat(
    calcBlockChance(total.strength, total.vitality, total.block_chance).toFixed(1)
  );

  // Gold/EXP gain: capped at +100% each (2× max)
  const goldGainPct = Math.min(100, total.gold_gain_pct);
  const expGainPct  = Math.min(100, total.exp_gain_pct);

  // Attack Speed: base + DEX scaling + gear bonus, capped
  const attackSpeed = parseFloat(
    Math.min(ATTACK_SPEED_CAP, BASE_ATTACK_SPEED + total.dexterity * DEX_ATTACK_SPEED + total.attack_speed).toFixed(2)
  );

  // Crit Damage: base 150% + LUK scaling + gear bonus, capped
  const critDmgPct = parseFloat(
    Math.min(CRIT_DMG_CAP, BASE_CRIT_DMG_PCT + total.luck * CRIT_DMG_LUK_RATE + total.crit_dmg_pct).toFixed(1)
  );

  // Elemental bonuses: character base (equipment/gems) + item stats
  const fireDmg      = Math.min(100, (character.fire_dmg      || 0) + total.fire_dmg);
  const iceDmg       = Math.min(100, (character.ice_dmg       || 0) + total.ice_dmg);
  const lightningDmg = Math.min(100, (character.lightning_dmg || 0) + total.lightning_dmg);
  const poisonDmg    = Math.min(100, (character.poison_dmg    || 0) + total.poison_dmg);
  const bloodDmg     = Math.min(100, (character.blood_dmg     || 0) + total.blood_dmg);
  const sandDmg      = Math.min(100, (character.sand_dmg      || 0) + total.sand_dmg);

  const derived = {
    attackPower,
    rawDefense:      Math.round(rawDefense),
    damageReduction: parseFloat((damageReduction * 100).toFixed(1)),
    maxHp,
    maxMp,
    critChance,
    critDmgPct,
    lifesteal:       total.lifesteal,
    hpRegen,
    mpRegen,
    evasion,
    blockChance,
    blockReduction:  BLOCK_DAMAGE_REDUCTION * 100,
    goldGainPct,
    expGainPct,
    attackSpeed,
    fireDmg,
    iceDmg,
    lightningDmg,
    poisonDmg,
    bloodDmg,
    sandDmg,
  };

  return { base, equipBonus, setBonus, total, derived };
}

// ─────────────────────────────────────────────────────────────────────────────
// DAMAGE ROLL
// ─────────────────────────────────────────────────────────────────────────────
// Map element names to totalStats keys
const ELEMENT_STAT_MAP = {
  fire: "fire_dmg", ice: "ice_dmg", lightning: "lightning_dmg",
  poison: "poison_dmg", blood: "blood_dmg", sand: "sand_dmg",
};

export function rollDamage(totalStats, characterClass, skill = null, character = null) {
  const scaling = CLASS_DAMAGE_SCALING[characterClass] || CLASS_DAMAGE_SCALING.warrior;
  const baseDmg =
    totalStats[scaling.primary] * scaling.primaryMult +
    totalStats[scaling.secondary] * scaling.secondaryMult +
    (totalStats.damage || 0);

  const skillMult  = skill ? (skill.damage || 1.0) : 1.0;
  const critChance = calcCritChance(totalStats.dexterity, totalStats.luck) / 100;
  const isCrit     = Math.random() < critChance;
  const critDmgMult = isCrit ? ((BASE_CRIT_DMG_PCT + (totalStats.luck || 0) * CRIT_DMG_LUK_RATE + (totalStats.crit_dmg_pct || 0)) / 100) : 1.0;
  const variance   = 0.95 + Math.random() * 0.1;

  // Elemental bonus: if skill has an element, apply character's elemental % bonus
  let elementalMult = 1.0;
  if (skill?.element && ELEMENT_STAT_MAP[skill.element] && character) {
    const elemPct = (character[ELEMENT_STAT_MAP[skill.element]] || 0) + (totalStats[ELEMENT_STAT_MAP[skill.element]] || 0);
    elementalMult = 1 + elemPct / 100;
  }

  return {
    damage: Math.max(1, Math.round(baseDmg * skillMult * critDmgMult * variance * elementalMult)),
    isCrit,
    elementalMult,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INCOMING DAMAGE  (evasion → block → defense)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * calculateDamageTaken(rawEnemyDmg, derived, enemyLevel, playerLevel)
 *
 * Flow:
 *   1. Evasion check  → 0 damage
 *   2. Block check    → 60% damage reduction
 *   3. Defense formula → soft-curve mitigation
 *
 * Returns: { finalDamage, evaded, blocked }
 */
export function calculateDamageTaken(rawEnemyDmg, derived, enemyLevel = 1, playerLevel = 1) {
  const { evasion, blockChance, rawDefense } = derived;

  // 1. Evasion
  if (Math.random() * 100 < evasion) {
    return { finalDamage: 0, evaded: true, blocked: false };
  }

  // 2. Block
  let dmg = rawEnemyDmg;
  let blocked = false;
  if (Math.random() * 100 < blockChance) {
    dmg = Math.round(dmg * (1 - BLOCK_DAMAGE_REDUCTION));
    blocked = true;
  }

  // 3. Defense reduction
  const reduction = calcDefenseReduction(rawDefense);
  dmg = dmg * (1 - reduction);

  // 4. Level difference bonus mitigation
  const levelDiff = Math.max(0, playerLevel - enemyLevel);
  if (levelDiff > 5) {
    const bonusReduction = Math.min(0.2, levelDiff * 0.02);
    dmg *= (1 - bonusReduction);
  }

  // Minimum 10% of raw (prevents immortality)
  const minDamage = Math.ceil(rawEnemyDmg * 0.10);
  return {
    finalDamage: Math.max(minDamage, Math.round(dmg)),
    evaded: false,
    blocked,
  };
}

// Legacy alias — kept so existing call sites don't break
export function mitigateDamage(rawEnemyDmg, totalStats, enemyLevel = 1, playerLevel = 1) {
  const defense = totalStats.vitality * 0.3 + (totalStats.defense || 0);
  const derived = {
    evasion: 0,
    blockChance: 0,
    rawDefense: defense,
  };
  const { finalDamage } = calculateDamageTaken(rawEnemyDmg, derived, enemyLevel, playerLevel);
  return finalDamage;
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD COMPAT SHIM
// ─────────────────────────────────────────────────────────────────────────────
export function calculateTotalStats(character, equippedItems = [], extraSetStats = null) {
  const { base, equipBonus, setBonus, total } = calculateFinalStats(character, equippedItems, extraSetStats);
  return { base, bonus: equipBonus, setBonus, total };
}