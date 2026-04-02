import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Gem, Star, Shield, Swords, Zap, Flame, Snowflake, Heart,
  ArrowUpCircle, Trash2, ChevronRight, Package, Lock, Sparkles,
  TrendingUp, CircleDot, Target, Eye, Droplets, Wind,
} from "lucide-react";

// ─── Rune Constants ─────────────────────────────────────────────────────────

const RUNE_MAX_SLOTS = 6;

const RUNE_STAT_LABELS = {
  attack_pct: "ATK%", crit_chance: "Crit Chance%", crit_dmg_pct: "Crit DMG%",
  boss_dmg_pct: "Boss DMG%", attack_speed: "ATK Speed%", lifesteal: "Lifesteal%",
  defense_pct: "DEF%", block_chance: "Block%", evasion: "Evasion%",
  hp_flat: "HP", mp_flat: "MP", hp_regen: "HP Regen", mp_regen: "MP Regen",
  exp_pct: "EXP%", gold_pct: "Gold%", drop_chance: "Drop%",
  fire_dmg: "Fire DMG%", ice_dmg: "Ice DMG%", lightning_dmg: "Lightning DMG%",
  poison_dmg: "Poison DMG%", blood_dmg: "Blood DMG%", sand_dmg: "Sand DMG%",
};

const RUNE_STAT_ICONS = {
  attack_pct: Swords, crit_chance: Target, crit_dmg_pct: Zap,
  boss_dmg_pct: Swords, attack_speed: Wind, lifesteal: Heart,
  defense_pct: Shield, block_chance: Shield, evasion: Eye,
  hp_flat: Heart, mp_flat: Droplets, hp_regen: Heart, mp_regen: Droplets,
  exp_pct: TrendingUp, gold_pct: Star, drop_chance: Sparkles,
  fire_dmg: Flame, ice_dmg: Snowflake, lightning_dmg: Zap,
  poison_dmg: CircleDot, blood_dmg: Heart, sand_dmg: Wind,
};

const RUNE_CATEGORY_COLORS = {
  offensive:  { border: "border-red-500/40",    bg: "bg-red-500/10",    text: "text-red-400",    icon: Swords },
  defensive:  { border: "border-blue-500/40",   bg: "bg-blue-500/10",   text: "text-blue-400",   icon: Shield },
  utility:    { border: "border-green-500/40",  bg: "bg-green-500/10",  text: "text-green-400",  icon: Star },
  elemental:  { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400", icon: Flame },
};

const RARITY_COLORS = {
  common:    { text: "text-gray-400",   border: "border-gray-500/30",   bg: "bg-gray-500/10",   hex: "#9ca3af" },
  uncommon:  { text: "text-green-400",  border: "border-green-500/30",  bg: "bg-green-500/10",  hex: "#22c55e" },
  rare:      { text: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/10",   hex: "#3b82f6" },
  epic:      { text: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10", hex: "#a855f7" },
  legendary: { text: "text-amber-400",  border: "border-amber-500/30",  bg: "bg-amber-500/10",  hex: "#f59e0b" },
  mythic:    { text: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/10",    hex: "#ef4444" },
};

const ENHANCE_COSTS = [0, 200, 500, 1000, 1800, 3000, 5000, 8000, 12000, 18000, 26000, 36000, 50000, 70000, 100000];

// ─── Component ──────────────────────────────────────────────────────────────

export default function Runes({ character, onCharacterUpdate }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRune, setSelectedRune] = useState(null);
  const [filterRarity, setFilterRarity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [confirmModal, setConfirmModal] = useState(null);
  const [enhanceResult, setEnhanceResult] = useState(null);

  // ── Queries ──
  const { data: runeData, isLoading } = useQuery({
    queryKey: ["runes", character?.id],
    queryFn: () => base44.functions.invoke("runes", { characterId: character.id, action: "list" }),
    enabled: !!character?.id,
  });

  const allRunes = runeData?.runes || [];
  const equippedRunes = allRunes.filter(r => r.slot);
  const inventoryRunes = allRunes.filter(r => !r.slot);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventoryRunes.filter(r => {
      if (filterRarity !== "all" && r.rarity !== filterRarity) return false;
      if (filterCategory !== "all" && r.runeType !== filterCategory) return false;
      return true;
    });
  }, [inventoryRunes, filterRarity, filterCategory]);

  // ── Mutations ──
  const equipMutation = useMutation({
    mutationFn: ({ runeId, slot }) =>
      base44.functions.invoke("runes", { characterId: character.id, action: "equip", runeId, slot }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runes"] });
      setSelectedRune(null);
      toast({ title: "Rune equipped!", duration: 1500 });
    },
    onError: (err) => toast({ title: "Equip failed", description: err?.message, variant: "destructive" }),
  });

  const unequipMutation = useMutation({
    mutationFn: (runeId) =>
      base44.functions.invoke("runes", { characterId: character.id, action: "unequip", runeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runes"] });
      toast({ title: "Rune unequipped", duration: 1500 });
    },
    onError: (err) => toast({ title: "Unequip failed", description: err?.message, variant: "destructive" }),
  });

  const enhanceMutation = useMutation({
    mutationFn: (runeId) =>
      base44.functions.invoke("runes", { characterId: character.id, action: "enhance", runeId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["runes"] });
      if (onCharacterUpdate) onCharacterUpdate();
      setEnhanceResult(data);
    },
    onError: (err) => toast({ title: "Enhance failed", description: err?.message, variant: "destructive" }),
  });

  const salvageMutation = useMutation({
    mutationFn: (runeId) =>
      base44.functions.invoke("runes", { characterId: character.id, action: "salvage", runeId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["runes"] });
      if (onCharacterUpdate) onCharacterUpdate();
      setSelectedRune(null);
      toast({ title: `Salvaged for ${data?.goldGained?.toLocaleString() || 0} gold`, duration: 2000 });
    },
    onError: (err) => toast({ title: "Salvage failed", description: err?.message, variant: "destructive" }),
  });

  // ── Render rune card ──
  const renderRuneCard = (rune, compact = false) => {
    const rarity = RARITY_COLORS[rune.rarity] || RARITY_COLORS.common;
    const category = RUNE_CATEGORY_COLORS[rune.runeType] || RUNE_CATEGORY_COLORS.offensive;
    const MainIcon = RUNE_STAT_ICONS[rune.mainStat] || Gem;
    const isSelected = selectedRune?.id === rune.id;

    return (
      <motion.div
        key={rune.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={() => setSelectedRune(isSelected ? null : rune)}
        className={`rounded-xl border-2 p-3 cursor-pointer transition-all hover:scale-[1.02] ${
          isSelected ? "ring-2 ring-white/40 scale-[1.02]" : ""
        } ${category.bg} bg-gray-800/80`}
        style={{ borderColor: rarity.hex + (isSelected ? "cc" : "55") }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.bg} border ${category.border}`}>
            <MainIcon className={`w-4 h-4 ${category.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{rune.name}</p>
            <div className="flex gap-1 items-center">
              <Badge className={`text-[8px] px-1 py-0 ${rarity.text} ${rarity.bg} ${rarity.border}`}>{rune.rarity}</Badge>
              <span className="text-[8px] text-muted-foreground">Lv.{rune.level || 1}</span>
            </div>
          </div>
        </div>

        {/* Main stat */}
        <div className={`text-xs font-bold ${rarity.text} mb-1`}>
          {RUNE_STAT_LABELS[rune.mainStat] || rune.mainStat} +{rune.mainValue}
        </div>

        {/* Sub-stats */}
        {!compact && (rune.subStats || []).length > 0 && (
          <div className="space-y-0.5">
            {(rune.subStats || []).map((sub, i) => (
              <div key={i} className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="text-gray-500">+{sub.value}</span>
                <span>{RUNE_STAT_LABELS[sub.stat] || sub.stat}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // ── Render equipped slot ──
  const renderSlot = (slotNum) => {
    const rune = equippedRunes.find(r => r.slot === slotNum);
    const rarity = rune ? (RARITY_COLORS[rune.rarity] || RARITY_COLORS.common) : null;
    const category = rune ? (RUNE_CATEGORY_COLORS[rune.runeType] || RUNE_CATEGORY_COLORS.offensive) : null;
    const MainIcon = rune ? (RUNE_STAT_ICONS[rune.mainStat] || Gem) : Gem;

    return (
      <div
        key={slotNum}
        className={`rounded-xl border-2 p-3 min-h-[120px] flex flex-col transition-all cursor-pointer ${
          rune
            ? `${category.bg} bg-gray-800/80 hover:brightness-110`
            : "border-gray-700 bg-gray-900/50 hover:border-gray-500"
        } ${selectedRune && !rune ? "ring-2 ring-primary/50 border-primary/50" : ""}`}
        style={rune ? { borderColor: rarity.hex + "66" } : undefined}
        onClick={() => {
          if (rune) {
            setConfirmModal({
              title: "Unequip Rune",
              message: `Unequip ${rune.name} from slot ${slotNum}?`,
              onConfirm: () => { unequipMutation.mutate(rune.id); setConfirmModal(null); },
            });
          } else if (selectedRune) {
            equipMutation.mutate({ runeId: selectedRune.id, slot: slotNum });
          }
        }}
      >
        <div className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wider">Slot {slotNum}</div>
        {rune ? (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.bg} border ${category.border}`}>
                <MainIcon className={`w-4 h-4 ${category.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white truncate">{rune.name}</p>
                <Badge className={`text-[7px] px-1 py-0 ${rarity.text} ${rarity.bg}`}>{rune.rarity} Lv.{rune.level}</Badge>
              </div>
            </div>
            <div className={`text-[10px] font-bold ${rarity.text}`}>
              {RUNE_STAT_LABELS[rune.mainStat]} +{rune.mainValue}
            </div>
            {(rune.subStats || []).map((sub, i) => (
              <div key={i} className="text-[9px] text-gray-500">+{sub.value} {RUNE_STAT_LABELS[sub.stat]}</div>
            ))}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <Gem className="w-6 h-6 text-gray-700" />
            <span className="text-[9px] text-gray-600">
              {selectedRune ? "Click to equip" : "Empty"}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading runes...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-orbitron text-xl font-bold flex items-center gap-2">
            <Gem className="w-5 h-5 text-purple-400" /> Rune System
          </h2>
          <p className="text-xs text-muted-foreground">
            Equip runes to boost your stats. Enhance with gold, salvage for resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Gem className="w-3 h-3" /> {equippedRunes.length}/{RUNE_MAX_SLOTS} equipped
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Package className="w-3 h-3" /> {inventoryRunes.length} in inventory
          </Badge>
        </div>
      </div>

      {/* Equipped Rune Slots */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5" /> Equipped Runes
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map(renderSlot)}
        </div>
        {selectedRune && !selectedRune.slot && (
          <p className="text-xs text-primary mt-2 animate-pulse">Click an empty slot to equip the selected rune</p>
        )}
      </div>

      {/* Selected Rune Detail Panel */}
      <AnimatePresence>
        {selectedRune && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedRune.name}</h3>
                  <div className="flex gap-1.5 mt-1">
                    <Badge className={`text-[9px] ${RARITY_COLORS[selectedRune.rarity]?.text} ${RARITY_COLORS[selectedRune.rarity]?.bg}`}>
                      {selectedRune.rarity}
                    </Badge>
                    <Badge className={`text-[9px] ${RUNE_CATEGORY_COLORS[selectedRune.runeType]?.text} ${RUNE_CATEGORY_COLORS[selectedRune.runeType]?.bg}`}>
                      {selectedRune.runeType}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">Lv.{selectedRune.level || 1}/15</Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setSelectedRune(null)}>Close</Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-900/50 rounded-lg p-2.5">
                  <p className="text-[9px] text-muted-foreground mb-1">MAIN STAT</p>
                  <p className={`text-sm font-bold ${RARITY_COLORS[selectedRune.rarity]?.text}`}>
                    {RUNE_STAT_LABELS[selectedRune.mainStat]} +{selectedRune.mainValue}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2.5">
                  <p className="text-[9px] text-muted-foreground mb-1">SUB-STATS</p>
                  {(selectedRune.subStats || []).map((sub, i) => (
                    <p key={i} className="text-xs text-gray-300">+{sub.value} {RUNE_STAT_LABELS[sub.stat]}</p>
                  ))}
                  {(selectedRune.subStats || []).length === 0 && (
                    <p className="text-xs text-gray-600">None</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {/* Enhance */}
                {(selectedRune.level || 1) < 15 && (
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-amber-600 hover:bg-amber-500 gap-1"
                    disabled={enhanceMutation.isPending}
                    onClick={() => enhanceMutation.mutate(selectedRune.id)}
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    Enhance ({(ENHANCE_COSTS[selectedRune.level || 1] || 0).toLocaleString()}g)
                  </Button>
                )}

                {/* Salvage (only if not equipped) */}
                {!selectedRune.slot && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1"
                    onClick={() => setConfirmModal({
                      title: "Salvage Rune",
                      message: `Destroy ${selectedRune.name} for gold?`,
                      onConfirm: () => { salvageMutation.mutate(selectedRune.id); setConfirmModal(null); },
                      variant: "destructive",
                    })}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Salvage
                  </Button>
                )}

                {/* Unequip */}
                {selectedRune.slot && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => unequipMutation.mutate(selectedRune.id)}
                  >
                    Unequip
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Rune Inventory ({filteredInventory.length})
          </p>
          <div className="flex gap-1.5">
            <select
              className="text-[10px] bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300"
              value={filterRarity}
              onChange={e => setFilterRarity(e.target.value)}
            >
              <option value="all">All Rarities</option>
              {["common", "uncommon", "rare", "epic", "legendary", "mythic"].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <select
              className="text-[10px] bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="all">All Types</option>
              {["offensive", "defensive", "utility", "elemental"].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
            <Gem className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No runes in inventory</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Runes drop from dungeon bosses, tower floors, and expedition rewards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <AnimatePresence>
              {filteredInventory.map(rune => renderRuneCard(rune))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setConfirmModal(null)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 text-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-2 text-white">{confirmModal.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{confirmModal.message}</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={() => setConfirmModal(null)}>Cancel</Button>
              <Button
                size="sm"
                className={confirmModal.variant === "destructive" ? "bg-red-600 hover:bg-red-500" : "bg-primary hover:bg-primary/80"}
                onClick={confirmModal.onConfirm}
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhance Result Modal */}
      {enhanceResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setEnhanceResult(null); setSelectedRune(enhanceResult.rune || selectedRune); }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-gradient-to-b from-gray-900 to-gray-950 border-2 border-amber-500/50 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl shadow-amber-500/20"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", damping: 12 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 bg-amber-500/20 border-amber-500/40"
            >
              <ArrowUpCircle className="w-9 h-9 text-amber-400" />
            </motion.div>
            <h3 className="font-orbitron font-bold text-lg mb-2 text-amber-300">Rune Enhanced!</h3>
            <p className="text-sm text-gray-300 mb-1">Level {(enhanceResult.newLevel || 2) - 1} → {enhanceResult.newLevel || 2}</p>
            <p className="text-xs text-gray-500 mb-4">Cost: {(enhanceResult.goldCost || 0).toLocaleString()} gold</p>
            {enhanceResult.rune && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className={`text-sm font-bold ${RARITY_COLORS[enhanceResult.rune.rarity]?.text}`}>
                  {RUNE_STAT_LABELS[enhanceResult.rune.mainStat]} +{enhanceResult.rune.mainValue}
                </p>
                {(enhanceResult.rune.subStats || []).map((sub, i) => (
                  <p key={i} className="text-xs text-gray-400">+{sub.value} {RUNE_STAT_LABELS[sub.stat]}</p>
                ))}
              </div>
            )}
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-500"
              onClick={() => { setEnhanceResult(null); setSelectedRune(enhanceResult.rune || selectedRune); }}
            >
              Continue
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
