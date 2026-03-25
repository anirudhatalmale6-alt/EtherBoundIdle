// ============================================================
// GAME CONFIG — zentrale Stelle für alle Spielparameter
// Bearbeite diese Datei um das Spiel zu balancieren.
// ============================================================

// ── PROGRESSION ─────────────────────────────────────────────
export const PROGRESSION = {
  // EXP-Kurve: exp = floor(BASE_EXP * EXP_GROWTH^(level-1))
  BASE_EXP: 100,
  EXP_GROWTH: 1.15,

  // Stat-Punkte pro Level-Up
  STAT_POINTS_PER_LEVEL: 3,
  SKILL_POINTS_PER_LEVEL: 1,

  // HP/MP pro Level-Up (flach)
  HP_PER_LEVEL: 5,
  MP_PER_LEVEL: 3,

  // Maximales Level
  MAX_LEVEL: 100,
};

// ── COMBAT ───────────────────────────────────────────────────
export const COMBAT = {
  // Auto-Attack Intervall (ms) — niedrigerer Wert = schneller
  BASE_ATTACK_INTERVAL_MS: 1000,

  // Kritischer Treffer
  BASE_CRIT_CHANCE: 0.05,       // 5% Basischance
  CRIT_DAMAGE_MULTIPLIER: 1.5,  // 150% Schaden bei Crit

  // Evasion & Block
  BASE_EVASION: 0.05,           // 5% Ausweichenchance
  BASE_BLOCK: 0.05,             // 5% Blockchance
  BLOCK_REDUCTION: 0.5,         // Geblockte Angriffe: 50% Schadensreduktion

  // Verteidigung (Defense pro Punkt senkt Schaden um %)
  DEFENSE_TO_REDUCTION: 0.002,  // 1 Defense = 0.2% Schadensreduktion (max ~60%)
  MAX_DAMAGE_REDUCTION: 0.6,    // Maximal 60% Schadensreduktion

  // Lifesteal-Begrenzung
  MAX_LIFESTEAL: 50,            // Max. 50% Lifesteal

  // Feindkampf: Schaden-Varianz
  ENEMY_DMG_VARIANCE: 0.4,      // Feindschaden ±40% (0.8 – 1.2 Multiplikator)

  // Idle-Kampf: Belohnungsscaler vs. aktiv
  IDLE_REWARD_MULTIPLIER: 0.5,

  // Auto-Trank bei <X% HP
  AUTO_POTION_THRESHOLD: 0.4,
};

// ── ECONOMY ──────────────────────────────────────────────────
export const ECONOMY = {
  // Startkapital
  STARTING_GOLD: 100,
  STARTING_GEMS: 10,

  // Maximale Offline-Stunden (Idle-Belohnung)
  MAX_OFFLINE_HOURS: 7 * 24, // 7 Tage

  // Gold-Transmutation (Gold → Gems)
  TRANSMUTE_COST_BASE: 1000,
  TRANSMUTE_COST_SCALING: 1.5,   // jede weitere Transmutation kostet mehr
  TRANSMUTE_GEMS_REWARD: 1,

  // Gem Lab
  GEM_LAB_BASE_RATE: 0.1,         // Gems/Minute bei Level 0
  GEM_LAB_PRODUCTION_BONUS: 0.05, // +0.05 Gems/Min pro Production-Level
  GEM_LAB_SPEED_REDUCTION: 0.1,   // 10% schnellerer Zyklus pro Speed-Level
  GEM_LAB_EFFICIENCY_BONUS: 0.1,  // 10% mehr Output pro Efficiency-Level

  // Shop-Rotation Intervall (Stunden)
  SHOP_ROTATION_HOURS: 4,
};

// ── LOOT ─────────────────────────────────────────────────────
export const LOOT = {
  // Basiswahrscheinlichkeit ein Item zu droppen (nicht Boss)
  BASE_DROP_CHANCE: 0.01,          // 1%
  MAX_DROP_CHANCE: 0.04,           // 4% (durch Luck)
  LUCK_DROP_BONUS: 0.0003,         // pro Luck-Punkt

  // Boss-Drop-Wahrscheinlichkeit
  BOSS_DROP_CHANCE: 0.25,          // 25%

  // Smart Loot: Chance ein klassen-passendes Item zu droppen
  SMART_LOOT_CHANCE: 0.65,         // 65%
  SMART_LOOT_WEAPON_CHANCE: 0.40,  // 40% davon ist Waffe
  SMART_LOOT_ARMOR_CHANCE: 0.35,   // 35% davon ist Rüstung

  // Luck erhöht Seltenheits-Gewichte ab Luck > 5
  LUCK_RARITY_BONUS_PER_POINT: 0.1,
};

// ── UPGRADES ─────────────────────────────────────────────────
export const UPGRADES = {
  // Safe-Upgrade
  SAFE_GOLD_BASE: 500,            // Gold-Basiskosten für +1
  SAFE_GOLD_SCALING: 1,           // Gold = BASE * (currentLevel + 1) * rarityMult
  SAFE_ORE_BASE: 5,
  SAFE_ORE_SCALING: 2,
  SAFE_STAT_BONUS_PER_LEVEL: 0.02, // +2% Stats pro Safe-Upgrade
  SAFE_MAX_LEVEL: 20,

  // Star-Upgrade Erfolgswahrscheinlichkeiten [%] für Sterne 1-7
  STAR_SUCCESS_CHANCES: [90, 75, 50, 35, 12, 8, 2],
  STAR_GEM_BASE: 5,
  STAR_GEM_GROWTH: 1.5,           // Gem-Kosten = BASE * GROWTH^currentStar * rarityMult
  STAR_STAT_BONUS_PER_STAR: 0.05, // +5% Stats pro Star
  STAR_MAX_LEVEL: 7,

  // Awakening
  AWAKEN_GEM_COST: 50,
  AWAKEN_STAT_BONUS: 0.5,         // +50% Stats bei Awakening
};

// ── GUILDS ───────────────────────────────────────────────────
export const GUILDS = {
  MAX_MEMBERS: 20,
  MAX_LEVEL: 30,
  BASE_EXP_TO_NEXT: 1000,
  EXP_GROWTH: 1.3,

  // Perks (pro Level)
  PERK_BONUS_PER_LEVEL: 0.05,  // 5% pro Perk-Level
  MAX_PERK_LEVEL: 10,

  // Guild Boss
  BOSS_RESPAWN_HOURS: 24,
  BOSS_HP_BASE: 10000,
  BOSS_HP_PER_GUILD_LEVEL: 5000,

  // Token-Belohnungen
  TOKEN_REWARD_PER_BOSS_DAMAGE: 0.01, // 1 Token pro 100 Schaden
};

// ── PARTIES ──────────────────────────────────────────────────
export const PARTIES = {
  MAX_SIZE: 6,
  EXP_BONUS_PER_MEMBER: 0.05,   // +5% EXP pro zusätzlichem Mitglied
  GOLD_BONUS_PER_MEMBER: 0.05,  // +5% Gold pro zusätzlichem Mitglied
  INVITE_EXPIRY_MINUTES: 5,
};

// ── DAILY LOGIN ───────────────────────────────────────────────
export const DAILY_LOGIN = {
  BASE_GOLD: 100,
  BASE_GEMS: 2,
  STREAK_GOLD_MULTIPLIER: 1.1,   // 10% mehr Gold pro Streak-Tag
  MAX_STREAK_BONUS_DAYS: 30,     // Streak-Bonus maximal bis Tag 30

  // Meilenstein-Belohnungen (Tag → Gems-Bonus)
  MILESTONE_REWARDS: {
    7:  { gems: 10, label: "7-Day Streak!" },
    14: { gems: 25, label: "14-Day Streak!" },
    30: { gems: 60, label: "30-Day Master!" },
  },
};

// ── LIFE SKILLS ───────────────────────────────────────────────
export const LIFE_SKILLS = {
  BASE_GATHER_TICKS_PER_ITEM: 5, // Ticks bis ein Item gesammelt wird
  SPEED_REDUCTION_PER_LEVEL: 0.1, // 10% schneller pro Speed-Level
  LUCK_RARE_BONUS_PER_LEVEL: 0.05, // 5% mehr Seltenheits-Chance pro Luck-Level
  MAX_GATHER_LEVEL: 99,
  EXP_GROWTH: 1.12,
};

// ── RARITY MULTIPLIERS (für Upgrade-Kosten) ──────────────────
export const RARITY_MULTIPLIERS = {
  common:    1.0,
  uncommon:  1.3,
  rare:      1.7,
  epic:      2.2,
  legendary: 3.0,
  mythic:    4.0,
  set:       3.5,
  shiny:     5.0,
};

// ── SELL PRICES (Basis) ───────────────────────────────────────
export const SELL_PRICES = {
  common:    5,
  uncommon:  20,
  rare:      60,
  epic:      200,
  legendary: 600,
  mythic:    2000,
  set:       800,
  shiny:     3000,
};