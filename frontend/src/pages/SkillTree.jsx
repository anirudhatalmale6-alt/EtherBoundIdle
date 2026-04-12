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

const EFFECT_LABELS = {
  shield: { icon: "🛡️", label: "Shield", desc: (e) => `Absorbs ${e.value}% max HP for ${e.duration}T` },
  dot: { icon: "🔥", label: "DoT", desc: (e) => `${e.value}% dmg/turn for ${e.duration}T` },
  stun: { icon: "⚡", label: "Stun", desc: (e) => `Skip ${e.duration} turn${e.duration > 1 ? "s" : ""}` },
  slow: { icon: "🌀", label: "Slow", desc: (e) => `+50% dmg taken ${e.duration}T` },
  buff: { icon: "✨", label: "Buff", desc: (e) => `+${e.value}% ${(e.stat || "").toUpperCase()} ${e.duration}T` },
};

// ── Skill Preview Panel (left column) ──
function SkillPreview({ skill, skills, learnedSkills, skillPoints, charLevel, elemStats, onLearn, isPending }) {
  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-40">
        <Zap className="w-8 h-8 text-gray-600 mb-2" />
        <p className="text-xs text-gray-500">Select a skill to preview</p>
      </div>
    );
  }

  const elemCfg = skill.element ? ELEMENT_CONFIG[skill.element] : { icon: "🛡️", label: "Utility", color: "text-gray-400" };
  const elemColor = ELEM_BORDER[skill.element] || "#666";
  const learned = learnedSkills.includes(skill.id);
  const prereqMet = !skill.requires || learnedSkills.includes(skill.requires);
  const levelOk = charLevel >= skill.levelReq;
  const canLearn = !learned && prereqMet && levelOk && skillPoints >= skill.cost;
  const effectInfo = skill.effect ? EFFECT_LABELS[skill.effect.type] : null;

  return (
    <div className="p-3 space-y-3">
      {/* Icon + name */}
      <div className="flex flex-col items-center text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
          style={{
            border: `3px solid ${learned ? elemColor : "#555"}`,
            background: `radial-gradient(circle, ${elemColor}33, #1a1020 70%)`,
            boxShadow: learned ? `0 0 14px ${elemColor}44` : "none",
          }}
        >
          <span className="text-3xl">{elemCfg.icon}</span>
        </div>
        <h3 className="font-bold text-sm">{skill.name}</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
          <span className={SKILL_TIERS[skill.tier]?.color}>T{skill.tier} {SKILL_TIERS[skill.tier]?.label}</span>
          <span>· Lv.{skill.levelReq}</span>
        </div>
        {skill.element && (
          <span className={`text-[10px] mt-0.5 ${elemCfg.color}`}>{elemCfg.label}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-2 text-[11px]">
        {skill.damage > 0 ? (
          <span className="text-orange-400 flex items-center gap-0.5"><Swords className="w-3 h-3" /> {Math.round(skill.damage * 100)}%</span>
        ) : (
          <span className="text-blue-300 flex items-center gap-0.5"><Shield className="w-3 h-3" /> Utility</span>
        )}
        <span className="text-blue-400">{skill.mp} MP</span>
        <span className="text-gray-400">{skill.cooldown}T CD</span>
        <span className="text-amber-300">{skill.cost} SP</span>
      </div>

      {/* Effect */}
      {effectInfo && (
        <div className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-center">
          {effectInfo.icon} {effectInfo.label} — {effectInfo.desc(skill.effect)}
        </div>
      )}

      {/* Description */}
      <p className="text-[11px] text-muted-foreground leading-relaxed text-center">{skill.description}</p>

      {skill.synergy && (
        <p className="text-[10px] text-amber-400/70 italic text-center">💡 {skill.synergy}</p>
      )}

      {/* Prerequisite */}
      {skill.requires && (() => {
        const prereq = skills.find(s => s.id === skill.requires);
        const met = learnedSkills.includes(skill.requires);
        return (
          <p className="text-[11px] text-center">
            Requires: <span className={met ? "text-emerald-400" : "text-red-400"}>{prereq?.name || skill.requires}</span>
          </p>
        );
      })()}

      {/* Element bonus */}
      {skill.element && ELEMENT_CONFIG[skill.element]?.stat && (() => {
        const bonus = elemStats[ELEMENT_CONFIG[skill.element].stat] || 0;
        return bonus > 0 ? (
          <p className={`text-[10px] font-bold text-center ${ELEMENT_CONFIG[skill.element].color}`}>
            Your {ELEMENT_CONFIG[skill.element].label}: +{bonus}%
          </p>
        ) : null;
      })()}

      {/* Action */}
      <div className="pt-1">
        {learned && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs w-full justify-center">Learned</Badge>}
        {!learned && !levelOk && <p className="text-[11px] text-red-400 text-center">Requires Level {skill.levelReq}</p>}
        {!learned && levelOk && !prereqMet && <p className="text-[11px] text-red-400 text-center">Prerequisite not met</p>}
        {!learned && levelOk && prereqMet && skillPoints < skill.cost && <p className="text-[11px] text-red-400 text-center">Need {skill.cost - skillPoints} more SP</p>}
        {canLearn && (
          <Button
            size="sm"
            className="w-full h-8 text-xs gap-1 bg-violet-600 hover:bg-violet-500 text-white font-bold"
            onClick={() => onLearn(skill)}
            disabled={isPending}
          >
            <Zap className="w-3.5 h-3.5" /> Learn — {skill.cost} SP
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Synergy Panel (right column) ──
function SynergyPanel({ synergies, activeSynergies, learnedSkills, skills }) {
  const learnedSet = new Set(learnedSkills);

  if (synergies.length === 0) {
    return (
      <div className="p-3 text-center opacity-40">
        <p className="text-[10px] text-gray-500">No synergies for this class</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1.5">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-orbitron font-bold text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Synergies
        </span>
        <span className="text-[9px] text-amber-300/60">{activeSynergies.length}/{synergies.length}</span>
      </div>
      {synergies.map(syn => {
        const isActive = activeSynergies.some(a => a.id === syn.id);
        const progress = syn.requires.filter(id => learnedSet.has(id)).length;
        return (
          <div
            key={syn.id}
            className={`p-2 rounded-lg border ${
              isActive ? "border-amber-500/40 bg-amber-500/10" : "border-gray-700/30 bg-black/20 opacity-40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{syn.icon}</span>
              <span className={`text-[10px] font-bold flex-1 truncate ${isActive ? "text-amber-300" : "text-gray-500"}`}>{syn.name}</span>
              {isActive ? (
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <span className="text-[8px] text-gray-600 shrink-0">{progress}/{syn.requires.length}</span>
              )}
            </div>
            <p className={`text-[8px] leading-tight ${isActive ? "text-amber-200/70" : "text-gray-600"}`}>{syn.description}</p>
            <div className="flex gap-0.5 flex-wrap mt-1">
              {syn.requires.map(id => {
                const sk = skills.find(s => s.id === id);
                const has = learnedSet.has(id);
                return (
                  <span key={id} className={`text-[7px] px-1 py-0.5 rounded ${
                    has ? "bg-green-500/15 text-green-400" : "bg-gray-800 text-gray-600"
                  }`}>{sk?.name || id}</span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ──
export default function SkillTree({ character, onCharacterUpdate }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedTier, setExpandedTier] = useState(1);
  const [activeElement, setActiveElement] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

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

  const tierGroups = useMemo(() => {
    const groups = {};
    for (let t = 1; t <= 6; t++) groups[t] = [];
    for (const s of skills) {
      if (groups[s.tier]) groups[s.tier].push(s);
    }
    return groups;
  }, [skills]);

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
    return { learned: filtered.filter(s => learnedSkills.includes(s.id)).length, total: filtered.length };
  };

  // Build prerequisite chain lookup for connection lines
  const prereqMap = useMemo(() => {
    const map = {};
    for (const s of skills) {
      if (s.requires) map[s.id] = s.requires;
    }
    return map;
  }, [skills]);

  return (
    <div className="p-3 md:p-4 max-w-6xl mx-auto space-y-3">
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

      {/* Element filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        <button
          onClick={() => setActiveElement(null)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border-2 shrink-0 ${
            !activeElement ? "border-white/30 bg-white/10 text-white" : "border-transparent bg-white/5 text-gray-500"
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
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0"
              style={{
                border: `2px solid ${isActive ? color : "transparent"}`,
                background: isActive ? `${color}22` : "rgba(255,255,255,0.03)",
                color: isActive ? color : "#666",
              }}
            >
              {cfg.icon} <span className="hidden sm:inline">{cfg.label}</span> {c.learned}/{c.total}
            </button>
          );
        })}
      </div>

      {/* ═══ THREE COLUMN LAYOUT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_200px] gap-3">

        {/* LEFT: Skill Preview */}
        <div className="hidden lg:block border border-border rounded-xl bg-black/20 sticky top-4 self-start min-h-[300px]">
          <div className="px-2 py-1.5 border-b border-border/50">
            <span className="text-[10px] font-orbitron font-bold text-gray-400">SKILL PREVIEW</span>
          </div>
          <SkillPreview
            skill={selectedSkill}
            skills={skills}
            learnedSkills={learnedSkills}
            skillPoints={skillPoints}
            charLevel={charLevel}
            elemStats={elemStats}
            onLearn={(s) => learnMutation.mutate(s)}
            isPending={learnMutation.isPending}
          />
        </div>

        {/* CENTER: Tier Accordions */}
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5, 6].map(tier => {
            const meta = SKILL_TIERS[tier];
            const tierUnlocked = charLevel >= meta.levelReq;
            const isExpanded = expandedTier === tier;
            const filtered = getFilteredSkills(tierGroups[tier] || []);
            const { learned: tierLearned, total: tierTotal } = getTierProgress(tier);

            return (
              <div key={tier} className="border border-border rounded-xl overflow-hidden bg-black/20">
                {/* Tier Header */}
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : tier)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${
                    tierUnlocked ? "hover:bg-white/5" : "opacity-35"
                  } ${isExpanded ? "bg-white/5" : ""}`}
                >
                  <span className={`text-xs font-orbitron font-bold px-2 py-0.5 rounded ${meta.color}`}>T{tier}</span>
                  <span className={`text-sm font-bold flex-1 text-left ${tierUnlocked ? "text-gray-200" : "text-gray-600"}`}>{meta.label}</span>
                  {!tierUnlocked && <span className="text-[10px] text-gray-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Lv.{meta.levelReq}</span>}
                  <span className={`text-[11px] font-bold ${tierLearned === tierTotal && tierTotal > 0 ? "text-emerald-400" : "text-gray-500"}`}>{tierLearned}/{tierTotal}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {/* Expanded Skills */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-3 pb-3 pt-1 space-y-1">
                        {filtered.length === 0 && (
                          <p className="text-xs text-gray-600 text-center py-3">No skills for this element.</p>
                        )}
                        {filtered.map((skill, idx) => {
                          const learned = learnedSkills.includes(skill.id);
                          const prereqMet = !skill.requires || learnedSkills.includes(skill.requires);
                          const levelOk = charLevel >= skill.levelReq;
                          const canLearn = !learned && prereqMet && levelOk && skillPoints >= skill.cost;
                          const locked = !prereqMet || !levelOk;
                          const elemCfg = skill.element ? ELEMENT_CONFIG[skill.element] : { icon: "🛡️", label: "Utility", color: "text-gray-400" };
                          const elemColor = ELEM_BORDER[skill.element] || ELEM_BORDER.physical;
                          const isEquipped = equippedSkills.includes(skill.id);
                          const isSelected = selectedSkill?.id === skill.id;
                          const effectInfo = skill.effect ? EFFECT_LABELS[skill.effect.type] : null;

                          // Check if next skill in list requires this one (for connection line)
                          const hasChild = filtered.some(s => s.requires === skill.id);
                          const hasParent = skill.requires && filtered.some(s => s.id === skill.requires);

                          return (
                            <div key={skill.id} className="relative">
                              {/* Connection line from parent */}
                              {hasParent && (
                                <div className="absolute left-6 -top-1 w-0.5 h-1.5 rounded-full" style={{ background: learned ? elemColor : "#333" }} />
                              )}

                              <motion.div
                                layout
                                onClick={() => setSelectedSkill(isSelected ? null : skill)}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                                  learned ? "bg-white/5" : canLearn ? "border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10" : locked ? "border-gray-800 bg-black/20 opacity-35" : "border-gray-700/50 bg-black/10 hover:bg-white/5"
                                } ${isSelected ? "ring-1 ring-primary/60 bg-primary/5" : ""}`}
                                style={{ borderLeftWidth: learned ? 3 : 1, borderLeftColor: learned ? elemColor : undefined }}
                              >
                                {/* Element icon */}
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                  style={{
                                    border: `2px solid ${learned ? elemColor : locked ? "#333" : "#555"}`,
                                    background: learned ? `${elemColor}22` : "rgba(20,20,25,0.8)",
                                    boxShadow: learned ? `0 0 6px ${elemColor}33` : "none",
                                  }}
                                >
                                  <span className="text-base">{elemCfg.icon}</span>
                                </div>

                                {/* Skill info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`text-[12px] font-bold truncate ${learned ? "text-gray-100" : locked ? "text-gray-600" : "text-gray-300"}`}>
                                      {skill.name}
                                    </span>
                                    {isEquipped && (
                                      <span className="text-[7px] px-1 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 shrink-0 font-bold">EQ</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] ${learned ? "text-orange-400" : "text-gray-500"}`}>
                                      {skill.damage > 0 ? `⚔${Math.round(skill.damage * 100)}%` : "○ Utility"}
                                    </span>
                                    <span className={`text-[10px] ${learned ? "text-blue-400" : "text-gray-600"}`}>{skill.mp}MP</span>
                                    <span className={`text-[10px] ${learned ? "text-gray-400" : "text-gray-600"}`}>{skill.cooldown}T</span>
                                    {effectInfo && (
                                      <span className={`text-[9px] px-1 py-0.5 rounded ${learned ? "bg-white/10 text-gray-300" : "bg-white/5 text-gray-600"}`}>
                                        {effectInfo.icon}{effectInfo.label}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right: status */}
                                <div className="shrink-0 flex flex-col items-center gap-0.5">
                                  {learned && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                  {!learned && canLearn && (
                                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center animate-pulse">
                                      <Star className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                  {locked && !learned && <Lock className="w-3.5 h-3.5 text-gray-600" />}
                                  {!learned && <span className="text-[8px] text-gray-500">{skill.cost}SP</span>}
                                </div>
                              </motion.div>

                              {/* Connection line to child */}
                              {hasChild && (
                                <div className="absolute left-6 -bottom-1 w-0.5 h-1.5 rounded-full" style={{ background: learned ? elemColor : "#333" }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Synergies */}
        <div className="hidden lg:block border border-border rounded-xl bg-black/20 sticky top-4 self-start max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="px-3 py-1.5 border-b border-border/50">
            <span className="text-[10px] font-orbitron font-bold text-amber-400">SKILL SYNERGY</span>
          </div>
          <SynergyPanel
            synergies={allSynergies}
            activeSynergies={activeSynergies}
            learnedSkills={learnedSkills}
            skills={skills}
          />
        </div>
      </div>

      {/* MOBILE: Skill Preview (shown below tree on small screens) */}
      <div className="lg:hidden">
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
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ border: `2.5px solid ${ELEM_BORDER[selectedSkill.element] || "#666"}`, background: `${ELEM_BORDER[selectedSkill.element] || "#666"}22` }}
                  >
                    <span className="text-xl">{(selectedSkill.element && ELEMENT_CONFIG[selectedSkill.element]?.icon) || "🛡️"}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{selectedSkill.name}</h3>
                    <div className="text-[10px] text-muted-foreground">
                      <span className={SKILL_TIERS[selectedSkill.tier]?.color}>T{selectedSkill.tier}</span> · Lv.{selectedSkill.levelReq}
                      {selectedSkill.element && ` · ${ELEMENT_CONFIG[selectedSkill.element]?.label}`}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedSkill(null)} className="p-1"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="flex gap-2.5 text-xs flex-wrap">
                {selectedSkill.damage > 0 ? <span className="text-orange-400">⚔ {Math.round(selectedSkill.damage * 100)}%</span> : <span className="text-blue-300">Utility</span>}
                <span className="text-blue-400">{selectedSkill.mp}MP</span>
                <span className="text-gray-400">{selectedSkill.cooldown}T</span>
                <span className="text-amber-300">{selectedSkill.cost}SP</span>
              </div>
              {selectedSkill.effect && (() => {
                const ei = EFFECT_LABELS[selectedSkill.effect.type];
                return ei ? <div className="text-[10px] px-2 py-1.5 rounded bg-white/5 border border-white/10 text-gray-300">{ei.icon} {ei.label} — {ei.desc(selectedSkill.effect)}</div> : null;
              })()}
              <p className="text-[11px] text-muted-foreground">{selectedSkill.description}</p>
              {selectedSkill.requires && (() => {
                const prereq = skills.find(s => s.id === selectedSkill.requires);
                const met = learnedSkills.includes(selectedSkill.requires);
                return <p className="text-[11px]">Requires: <span className={met ? "text-emerald-400" : "text-red-400"}>{prereq?.name || selectedSkill.requires}</span></p>;
              })()}
              {(() => {
                const learned = learnedSkills.includes(selectedSkill.id);
                const prereqMet = !selectedSkill.requires || learnedSkills.includes(selectedSkill.requires);
                const levelOk = charLevel >= selectedSkill.levelReq;
                const canLearn = !learned && prereqMet && levelOk && skillPoints >= selectedSkill.cost;
                if (learned) return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Learned</Badge>;
                if (!levelOk) return <p className="text-[11px] text-red-400">Requires Lv.{selectedSkill.levelReq}</p>;
                if (!prereqMet) return <p className="text-[11px] text-red-400">Prerequisite not met</p>;
                if (skillPoints < selectedSkill.cost) return <p className="text-[11px] text-red-400">Need {selectedSkill.cost - skillPoints} more SP</p>;
                if (canLearn) return (
                  <Button size="sm" className="w-full h-8 text-xs gap-1 bg-violet-600 hover:bg-violet-500 text-white font-bold"
                    onClick={() => learnMutation.mutate(selectedSkill)} disabled={learnMutation.isPending}
                  ><Zap className="w-3.5 h-3.5" /> Learn — {selectedSkill.cost} SP</Button>
                );
                return null;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE: Synergies collapsible */}
      <div className="lg:hidden">
        {allSynergies.length > 0 && (
          <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-orbitron font-bold text-amber-400 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Synergies</span>
              <span className="text-[10px] text-amber-300/60">{activeSynergies.length}/{allSynergies.length}</span>
            </div>
            <div className="space-y-1.5">
              {allSynergies.map(syn => {
                const isActive = activeSynergies.some(a => a.id === syn.id);
                const learnedSet = new Set(learnedSkills);
                const progress = syn.requires.filter(id => learnedSet.has(id)).length;
                return (
                  <div key={syn.id} className={`flex items-center gap-2 p-2 rounded-lg border ${isActive ? "border-amber-500/40 bg-amber-500/10" : "border-gray-700/30 opacity-40"}`}>
                    <span className="text-base shrink-0">{syn.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold ${isActive ? "text-amber-300" : "text-gray-500"}`}>{syn.name}</span>
                      <p className={`text-[8px] ${isActive ? "text-amber-200/70" : "text-gray-600"}`}>{syn.description}</p>
                    </div>
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <span className="text-[8px] text-gray-600 shrink-0">{progress}/{syn.requires.length}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: Element Stack Bonuses */}
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
