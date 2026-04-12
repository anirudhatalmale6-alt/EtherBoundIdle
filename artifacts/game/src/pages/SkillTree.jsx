import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Lock, CheckCircle2, Sparkles, Flame, ChevronDown, ChevronUp, Shield, Swords, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CLASS_SKILLS, SKILL_TIERS, ELEMENT_CONFIG, SKILL_SYNERGIES, getActiveSynergies, ELEMENT_STACK_BONUSES, getElementStackBonuses } from "@/lib/skillData";
import SkillHotbar from "@/components/game/SkillHotbar";

const ELEMENT_ORDER = ["physical", "fire", "ice", "lightning", "poison", "blood", "sand", "arcane", "none"];

const ELEM_BORDER = {
  fire: "#fb923c", ice: "#22d3ee", lightning: "#fde047", poison: "#4ade80",
  blood: "#ef4444", sand: "#fbbf24", arcane: "#c084fc", physical: "#9ca3af", none: "#6b7280",
};

// Gold ring colors for the node border (like the reference)
const GOLD_RING = "#c8a84e";
const GOLD_RING_INNER = "#a08030";
const GOLD_GLOW = "0 0 10px rgba(200,168,78,0.3)";

const EFFECT_LABELS = {
  shield: "🛡️", dot: "🔥", stun: "⚡", slow: "🌀", buff: "✨",
};

// ── Circular Skill Node Component ──
function SkillNode({ skill, learned, canLearn, locked, isSelected, isEquipped, onClick }) {
  const elemCfg = skill.element ? ELEMENT_CONFIG[skill.element] : { icon: "🛡️", color: "text-gray-400" };
  const elemColor = ELEM_BORDER[skill.element] || ELEM_BORDER.physical;
  const effectIcon = skill.effect ? EFFECT_LABELS[skill.effect.type] : null;

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer select-none"
      style={{ width: 80 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
    >
      {/* Outer gold ring */}
      <div
        className="relative"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          padding: 3,
          background: learned
            ? `linear-gradient(135deg, ${GOLD_RING}, #e8c84e, ${GOLD_RING_INNER})`
            : canLearn
            ? `linear-gradient(135deg, #8b5cf6, #a78bfa, #7c3aed)`
            : `linear-gradient(135deg, #333, #444, #333)`,
          boxShadow: learned ? GOLD_GLOW
            : canLearn ? "0 0 10px rgba(139,92,246,0.4)"
            : isSelected ? "0 0 10px rgba(255,255,255,0.2)" : "none",
          opacity: locked ? 0.3 : 1,
        }}
      >
        {/* Inner circle */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: learned
              ? `radial-gradient(circle at 30% 30%, ${elemColor}44, #1a1020 70%)`
              : "radial-gradient(circle at 30% 30%, #2a2a35, #111118 70%)",
          }}
        >
          <span className="text-2xl leading-none drop-shadow-lg">{elemCfg.icon}</span>
        </div>

        {/* Status indicators */}
        {learned && (
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "2px solid #111" }}
          >
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
        {!learned && canLearn && (
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)", border: "2px solid #111" }}
          >
            <Star className="w-3 h-3 text-white" />
          </div>
        )}
        {locked && !learned && (
          <div className="absolute -top-0.5 -right-0.5">
            <Lock className="w-3.5 h-3.5 text-gray-600" />
          </div>
        )}

        {/* Effect badge bottom-left */}
        {effectIcon && learned && (
          <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-[10px]">
            {effectIcon}
          </div>
        )}

        {/* Equipped indicator */}
        {isEquipped && (
          <div className="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 rounded text-[6px] font-bold bg-primary text-primary-foreground border border-black">
            EQ
          </div>
        )}

        {/* Selected ring */}
        {isSelected && (
          <div className="absolute inset-[-4px] rounded-full border-2 border-white/40 pointer-events-none" />
        )}
      </div>

      {/* Skill name below node */}
      <span className={`text-[10px] font-bold text-center leading-tight mt-1.5 line-clamp-2 ${
        learned ? "text-gray-200" : locked ? "text-gray-600" : "text-gray-400"
      }`} style={{ maxWidth: 78 }}>
        {skill.name}
      </span>

      {/* Stats below name */}
      <span className={`text-[8px] ${learned ? "text-gray-400" : "text-gray-600"}`}>
        {skill.damage > 0 ? `${Math.round(skill.damage * 100)}%` : "Util"} · {skill.mp}MP
        {!learned && ` · ${skill.cost}SP`}
      </span>
    </motion.div>
  );
}

// ── SVG connection lines between nodes in a tier ──
function TierConnections({ tierSkills, positions, learnedSkills, allSkills }) {
  if (!positions || Object.keys(positions).length === 0) return null;

  const lines = [];
  for (const skill of tierSkills) {
    if (!skill.requires) continue;
    const fromPos = positions[skill.requires];
    const toPos = positions[skill.id];
    if (!fromPos || !toPos) continue;

    const learned = learnedSkills.includes(skill.id);
    const prereqLearned = learnedSkills.includes(skill.requires);
    const elemColor = ELEM_BORDER[skill.element] || "#666";

    lines.push(
      <line
        key={`${skill.requires}-${skill.id}`}
        x1={fromPos.x} y1={fromPos.y}
        x2={toPos.x} y2={toPos.y}
        stroke={learned ? elemColor : prereqLearned ? "#555" : "#2a2a2a"}
        strokeWidth={learned ? 3 : 2}
        strokeLinecap="round"
        opacity={learned ? 0.8 : prereqLearned ? 0.4 : 0.15}
      />
    );

    // Add a small dot at connection point
    if (learned || prereqLearned) {
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      lines.push(
        <circle
          key={`dot-${skill.requires}-${skill.id}`}
          cx={midX} cy={midY} r={3}
          fill={learned ? elemColor : "#444"}
          opacity={learned ? 0.6 : 0.3}
        />
      );
    }
  }

  return <>{lines}</>;
}

export default function SkillTree({ character, onCharacterUpdate }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedTier, setExpandedTier] = useState(1);
  const [activeElement, setActiveElement] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showSynergies, setShowSynergies] = useState(false);

  const charClass = character?.class || "warrior";
  const skills = CLASS_SKILLS[charClass] || [];
  const learnedSkills = character?.skills || [];
  const skillPoints = character?.skill_points || 0;
  const charLevel = character?.level || 1;
  const equippedSkills = character?.hotbar_skills || [];

  const elemStats = {
    fire_dmg: character?.fire_dmg || 0, ice_dmg: character?.ice_dmg || 0,
    lightning_dmg: character?.lightning_dmg || 0, poison_dmg: character?.poison_dmg || 0,
    blood_dmg: character?.blood_dmg || 0, sand_dmg: character?.sand_dmg || 0,
  };

  const learnMutation = useMutation({
    mutationFn: async (skill) => {
      const newSkills = [...learnedSkills, skill.id];
      const newPoints = skillPoints - skill.cost;
      await base44.entities.Character.update(character.id, { skills: newSkills, skill_points: newPoints });
      onCharacterUpdate({ ...character, skills: newSkills, skill_points: newPoints });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast({ title: "Skill learned!", duration: 1500 });
    },
  });

  // Group skills by tier
  const tierGroups = useMemo(() => {
    const groups = {};
    for (let t = 1; t <= 6; t++) groups[t] = [];
    for (const s of skills) {
      if (groups[s.tier]) groups[s.tier].push(s);
    }
    return groups;
  }, [skills]);

  // Available elements
  const availableElements = useMemo(() => {
    const elems = new Set();
    for (const s of skills) elems.add(s.element || "none");
    return ELEMENT_ORDER.filter(e => elems.has(e));
  }, [skills]);

  const elemCounts = useMemo(() => {
    const counts = {};
    for (const e of availableElements) {
      const es = skills.filter(s => (s.element || "none") === e);
      counts[e] = { total: es.length, learned: es.filter(s => learnedSkills.includes(s.id)).length };
    }
    return counts;
  }, [skills, learnedSkills, availableElements]);

  const allSynergies = SKILL_SYNERGIES[charClass] || [];
  const activeSynergies = getActiveSynergies(charClass, learnedSkills, equippedSkills);

  const getFilteredSkills = (tierSkills) => {
    if (!activeElement) return tierSkills;
    return tierSkills.filter(s => (s.element || "none") === activeElement);
  };

  const getTierProgress = (tier) => {
    const ts = tierGroups[tier] || [];
    const filtered = getFilteredSkills(ts);
    const learned = filtered.filter(s => learnedSkills.includes(s.id)).length;
    return { learned, total: filtered.length };
  };

  // Calculate positions for nodes within a tier (branching tree layout)
  const calculateNodePositions = (tierSkills) => {
    const positions = {};
    if (tierSkills.length === 0) return { positions, width: 0, height: 0 };

    const NODE_SIZE = 56;
    const H_GAP = 16; // horizontal gap between nodes
    const V_GAP = 24; // vertical gap between rows
    const NODE_TOTAL_W = 80; // total width including label
    const NODE_TOTAL_H = 90; // total height including label

    // Group by element for visual clustering
    const byElem = {};
    for (const s of tierSkills) {
      const e = s.element || "none";
      if (!byElem[e]) byElem[e] = [];
      byElem[e].push(s);
    }

    // Arrange in rows: max 4-5 nodes per row for readability
    const MAX_PER_ROW = 5;
    const totalNodes = tierSkills.length;
    const numRows = Math.ceil(totalNodes / MAX_PER_ROW);

    // Distribute nodes across rows, centered
    let nodeIdx = 0;
    let maxRowWidth = 0;

    // Create a flat ordered list: sort by element for visual grouping
    const ordered = [];
    for (const e of ELEMENT_ORDER) {
      if (byElem[e]) ordered.push(...byElem[e]);
    }
    if (byElem["none"]) ordered.push(...byElem["none"]);

    for (let row = 0; row < numRows; row++) {
      const rowStart = row * MAX_PER_ROW;
      const rowEnd = Math.min(rowStart + MAX_PER_ROW, totalNodes);
      const rowCount = rowEnd - rowStart;
      const rowWidth = rowCount * NODE_TOTAL_W + (rowCount - 1) * H_GAP;
      if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;
    }

    nodeIdx = 0;
    for (let row = 0; row < numRows; row++) {
      const rowStart = row * MAX_PER_ROW;
      const rowEnd = Math.min(rowStart + MAX_PER_ROW, totalNodes);
      const rowCount = rowEnd - rowStart;
      const rowWidth = rowCount * NODE_TOTAL_W + (rowCount - 1) * H_GAP;
      const offsetX = (maxRowWidth - rowWidth) / 2;

      for (let i = 0; i < rowCount; i++) {
        const skill = ordered[nodeIdx];
        const x = offsetX + i * (NODE_TOTAL_W + H_GAP) + NODE_TOTAL_W / 2;
        const y = row * (NODE_TOTAL_H + V_GAP) + NODE_TOTAL_H / 2;
        positions[skill.id] = { x, y };
        nodeIdx++;
      }
    }

    const totalHeight = numRows * NODE_TOTAL_H + (numRows - 1) * V_GAP;
    return { positions, width: maxRowWidth + NODE_TOTAL_W, height: totalHeight };
  };

  return (
    <div className="p-3 md:p-4 max-w-2xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Skill Tree
          </h2>
          <p className="text-[11px] text-muted-foreground capitalize">{charClass} · Lv.{charLevel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1 text-sm px-3 py-1">
            <Star className="w-3.5 h-3.5" /> {skillPoints} SP
          </Badge>
          <Badge variant="outline" className="text-xs">{learnedSkills.length}/{skills.length}</Badge>
        </div>
      </div>

      {/* Skill Hotbar */}
      <SkillHotbar character={character} onCharacterUpdate={onCharacterUpdate} />

      {/* Synergies toggle + element filter in one row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setShowSynergies(!showSynergies)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border shrink-0 transition-all ${
            showSynergies ? "border-amber-500/50 bg-amber-500/10 text-amber-400" : "border-border text-gray-500 hover:border-amber-500/30"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          {activeSynergies.length}/{allSynergies.length}
        </button>
        <div className="w-px h-5 bg-border shrink-0" />
        <button
          onClick={() => setActiveElement(null)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
            !activeElement ? "border-white/30 bg-white/10 text-white" : "border-transparent text-gray-500"
          }`}
        >All</button>
        {availableElements.map(elem => {
          const cfg = ELEMENT_CONFIG[elem] || { icon: "🛡️", label: elem };
          const c = elemCounts[elem] || { total: 0, learned: 0 };
          const isActive = activeElement === elem;
          const color = ELEM_BORDER[elem];
          return (
            <button
              key={elem}
              onClick={() => setActiveElement(isActive ? null : elem)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0"
              style={{
                border: `1.5px solid ${isActive ? color : "transparent"}`,
                background: isActive ? `${color}22` : "transparent",
                color: isActive ? color : "#666",
              }}
            >
              {cfg.icon} {c.learned}/{c.total}
            </button>
          );
        })}
      </div>

      {/* Synergies Panel */}
      <AnimatePresence>
        {showSynergies && allSynergies.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3 space-y-1.5">
              {allSynergies.map(syn => {
                const isActive = activeSynergies.some(a => a.id === syn.id);
                const learnedSet = new Set(learnedSkills);
                const progress = syn.requires.filter(id => learnedSet.has(id)).length;
                return (
                  <div key={syn.id} className={`flex items-center gap-2 p-2 rounded-lg border ${isActive ? "border-amber-500/40 bg-amber-500/10" : "border-gray-700/30 opacity-40"}`}>
                    <span className="text-lg shrink-0">{syn.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] font-bold ${isActive ? "text-amber-300" : "text-gray-500"}`}>{syn.name}</span>
                      <p className={`text-[9px] ${isActive ? "text-amber-200/70" : "text-gray-600"}`}>{syn.description}</p>
                    </div>
                    {isActive ? <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> : <span className="text-[9px] text-gray-600 shrink-0">{progress}/{syn.requires.length}</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Accordions with branching node trees */}
      <div className="space-y-1.5">
        {[1, 2, 3, 4, 5, 6].map(tier => {
          const meta = SKILL_TIERS[tier];
          const tierUnlocked = charLevel >= meta.levelReq;
          const isExpanded = expandedTier === tier;
          const allTierSkills = tierGroups[tier] || [];
          const filtered = getFilteredSkills(allTierSkills);
          const { learned: tierLearned, total: tierTotal } = getTierProgress(tier);
          const { positions, width: treeWidth, height: treeHeight } = calculateNodePositions(filtered);

          return (
            <div key={tier} className="border border-border rounded-xl overflow-hidden bg-black/20">
              {/* Tier Header */}
              <button
                onClick={() => setExpandedTier(isExpanded ? null : tier)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                  tierUnlocked ? "hover:bg-white/5" : "opacity-35"
                } ${isExpanded ? "bg-white/5" : ""}`}
              >
                <span className={`text-xs font-orbitron font-bold px-2 py-0.5 rounded ${meta.color}`}>T{tier}</span>
                <span className={`text-sm font-bold flex-1 text-left ${tierUnlocked ? "text-gray-200" : "text-gray-600"}`}>{meta.label}</span>
                {!tierUnlocked && <span className="text-[10px] text-gray-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Lv.{meta.levelReq}</span>}
                <span className={`text-[11px] font-bold ${tierLearned === tierTotal && tierTotal > 0 ? "text-emerald-400" : "text-gray-500"}`}>{tierLearned}/{tierTotal}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {/* Expanded: Branching Node Tree */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-4 pt-2">
                      {filtered.length === 0 ? (
                        <p className="text-xs text-gray-600 text-center py-4">No skills for this element at this tier.</p>
                      ) : (
                        <div className="relative overflow-x-auto scrollbar-hide">
                          <div className="relative mx-auto" style={{ width: treeWidth, minHeight: treeHeight }}>
                            {/* SVG connection lines */}
                            <svg
                              className="absolute inset-0 pointer-events-none"
                              width={treeWidth}
                              height={treeHeight}
                              style={{ overflow: "visible" }}
                            >
                              <TierConnections
                                tierSkills={filtered}
                                positions={positions}
                                learnedSkills={learnedSkills}
                                allSkills={skills}
                              />
                            </svg>

                            {/* Skill Nodes */}
                            {filtered.map(skill => {
                              const pos = positions[skill.id];
                              if (!pos) return null;
                              const learned = learnedSkills.includes(skill.id);
                              const prereqMet = !skill.requires || learnedSkills.includes(skill.requires);
                              const levelOk = charLevel >= skill.levelReq;
                              const canLearn = !learned && prereqMet && levelOk && skillPoints >= skill.cost;
                              const locked = !prereqMet || !levelOk;
                              const isEquipped = equippedSkills.includes(skill.id);
                              const isSelected = selectedSkill?.id === skill.id;

                              return (
                                <div
                                  key={skill.id}
                                  className="absolute"
                                  style={{
                                    left: pos.x - 40,
                                    top: pos.y - 45,
                                  }}
                                >
                                  <SkillNode
                                    skill={skill}
                                    learned={learned}
                                    canLearn={canLearn}
                                    locked={locked}
                                    isSelected={isSelected}
                                    isEquipped={isEquipped}
                                    onClick={() => setSelectedSkill(isSelected ? null : skill)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Selected Skill Detail Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border rounded-xl bg-card p-4 space-y-2.5"
            style={{ borderColor: `${ELEM_BORDER[selectedSkill.element] || "#555"}55` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    border: `3px solid ${GOLD_RING}`,
                    background: `radial-gradient(circle, ${ELEM_BORDER[selectedSkill.element] || "#666"}33, #1a1020 70%)`,
                    boxShadow: GOLD_GLOW,
                  }}
                >
                  <span className="text-2xl">{(selectedSkill.element && ELEMENT_CONFIG[selectedSkill.element]?.icon) || "🛡️"}</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">{selectedSkill.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className={SKILL_TIERS[selectedSkill.tier]?.color}>T{selectedSkill.tier} {SKILL_TIERS[selectedSkill.tier]?.label}</span>
                    <span>· Lv.{selectedSkill.levelReq}</span>
                    {selectedSkill.element && <span>· {ELEMENT_CONFIG[selectedSkill.element]?.label}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              {selectedSkill.damage > 0 ? (
                <span className="text-orange-400"><Swords className="w-3 h-3 inline mr-1" />{Math.round(selectedSkill.damage * 100)}%</span>
              ) : (
                <span className="text-blue-300"><Shield className="w-3 h-3 inline mr-1" />Utility</span>
              )}
              <span className="text-blue-400">{selectedSkill.mp} MP</span>
              <span className="text-gray-400">{selectedSkill.cooldown}T CD</span>
              <span className="text-amber-300">{selectedSkill.cost} SP</span>
            </div>

            {selectedSkill.effect && (
              <div className="text-[11px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                {selectedSkill.effect.type === "shield" && `🛡️ Shield — Absorbs ${selectedSkill.effect.value}% of max HP for ${selectedSkill.effect.duration} turns`}
                {selectedSkill.effect.type === "dot" && `🔥 DoT — ${selectedSkill.effect.value}% base damage/turn for ${selectedSkill.effect.duration} turns`}
                {selectedSkill.effect.type === "stun" && `⚡ Stun — Enemy skips ${selectedSkill.effect.duration} turn${selectedSkill.effect.duration > 1 ? "s" : ""}`}
                {selectedSkill.effect.type === "slow" && `🌀 Slow — +50% damage taken for ${selectedSkill.effect.duration} turn${selectedSkill.effect.duration > 1 ? "s" : ""}`}
                {selectedSkill.effect.type === "buff" && `✨ Buff — +${selectedSkill.effect.value}% ${selectedSkill.effect.stat?.toUpperCase()} for ${selectedSkill.effect.duration} turns`}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{selectedSkill.description}</p>

            {selectedSkill.synergy && <p className="text-xs text-amber-400/70 italic">💡 {selectedSkill.synergy}</p>}

            {selectedSkill.requires && (() => {
              const prereq = skills.find(s => s.id === selectedSkill.requires);
              const met = learnedSkills.includes(selectedSkill.requires);
              return <p className="text-xs">Requires: <span className={met ? "text-emerald-400" : "text-red-400"}>{prereq?.name || selectedSkill.requires}</span></p>;
            })()}

            {selectedSkill.element && ELEMENT_CONFIG[selectedSkill.element]?.stat && (() => {
              const bonus = elemStats[ELEMENT_CONFIG[selectedSkill.element].stat] || 0;
              return bonus > 0 ? <p className={`text-xs font-bold ${ELEMENT_CONFIG[selectedSkill.element].color}`}>Your {ELEMENT_CONFIG[selectedSkill.element].label} bonus: +{bonus}%</p> : null;
            })()}

            {(() => {
              const learned = learnedSkills.includes(selectedSkill.id);
              const prereqMet = !selectedSkill.requires || learnedSkills.includes(selectedSkill.requires);
              const levelOk = charLevel >= selectedSkill.levelReq;
              const canLearn = !learned && prereqMet && levelOk && skillPoints >= selectedSkill.cost;
              if (learned) return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Learned</Badge>;
              if (!levelOk) return <p className="text-xs text-red-400">Requires Level {selectedSkill.levelReq}</p>;
              if (!prereqMet) return <p className="text-xs text-red-400">Prerequisite not met</p>;
              if (skillPoints < selectedSkill.cost) return <p className="text-xs text-red-400">Need {selectedSkill.cost - skillPoints} more SP</p>;
              if (canLearn) return (
                <Button size="sm" className="w-full h-9 text-sm gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold"
                  onClick={(e) => { e.stopPropagation(); learnMutation.mutate(selectedSkill); }} disabled={learnMutation.isPending}
                ><Zap className="w-4 h-4" /> Learn — {selectedSkill.cost} SP</Button>
              );
              return null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Stack Bonuses */}
      {(() => {
        const { activeStacks } = getElementStackBonuses(charClass, equippedSkills);
        const ELEM_EMOJIS = { fire: "🔥", ice: "❄️", lightning: "⚡", poison: "☠️", blood: "🩸", sand: "🌪️" };
        const ELEM_COLORS = { fire: "text-orange-400", ice: "text-cyan-400", lightning: "text-yellow-300", poison: "text-green-400", blood: "text-red-400", sand: "text-amber-400" };
        const allElements = Object.keys(ELEMENT_STACK_BONUSES);
        return (
          <div className="border border-violet-500/20 bg-violet-500/5 rounded-xl p-3 space-y-2">
            <h3 className="font-orbitron font-bold text-xs text-violet-400 flex items-center gap-2"><Flame className="w-3.5 h-3.5" /> Element Stacks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {allElements.map(element => {
                const tiers = ELEMENT_STACK_BONUSES[element];
                const activeStack = activeStacks.find(s => s.element === element);
                const activeTier = activeStack?.tier || 0;
                return (
                  <div key={element} className={`rounded-lg p-2 ${activeTier > 0 ? "bg-white/5 border border-white/10" : "bg-black/20 border border-gray-800/50 opacity-40"}`}>
                    <p className={`text-[10px] font-bold mb-0.5 ${ELEM_COLORS[element]}`}>{ELEM_EMOJIS[element]} {element.charAt(0).toUpperCase() + element.slice(1)}</p>
                    {[2, 3, 4].map(t => {
                      const bonus = tiers[t];
                      if (!bonus) return null;
                      const isActive = activeTier >= t;
                      const bonusStr = Object.entries(bonus).map(([k, v]) => `+${v}% ${k.replace(/_/g, " ")}`).join(", ");
                      return <p key={t} className={`text-[9px] ${isActive ? ELEM_COLORS[element] : "text-gray-600"}`}>{isActive ? "✓" : "○"} {t}x: {bonusStr}</p>;
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
