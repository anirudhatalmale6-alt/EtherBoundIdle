import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Lock, CheckCircle2, Sparkles, Flame, X, ChevronDown, Shield, Swords } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CLASS_SKILLS, SKILL_TIERS, ELEMENT_CONFIG, SKILL_SYNERGIES, getActiveSynergies, ELEMENT_STACK_BONUSES, getElementStackBonuses } from "@/lib/skillData";
import SkillHotbar from "@/components/game/SkillHotbar";

const ELEMENT_ORDER = ["physical", "fire", "ice", "lightning", "poison", "blood", "sand", "arcane"];

const ELEM_BORDER = {
  fire: "#fb923c", ice: "#22d3ee", lightning: "#fde047", poison: "#4ade80",
  blood: "#ef4444", sand: "#fbbf24", arcane: "#c084fc", physical: "#9ca3af", none: "#6b7280",
};

const ELEM_GLOW = {
  fire: "0 0 12px rgba(251,146,60,0.4)", ice: "0 0 12px rgba(34,211,238,0.4)",
  lightning: "0 0 12px rgba(253,224,71,0.4)", poison: "0 0 12px rgba(74,222,128,0.4)",
  blood: "0 0 12px rgba(239,68,68,0.4)", sand: "0 0 12px rgba(251,191,36,0.4)",
  arcane: "0 0 12px rgba(192,132,252,0.4)", physical: "0 0 12px rgba(156,163,175,0.3)",
  none: "0 0 8px rgba(107,114,128,0.3)",
};

export default function SkillTree({ character, onCharacterUpdate }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [activeElement, setActiveElement] = useState("physical");

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

  // Group skills by element, then tier
  const treeData = useMemo(() => {
    const byElem = {};
    for (const s of skills) {
      const e = s.element || "none";
      if (!byElem[e]) byElem[e] = {};
      if (!byElem[e][s.tier]) byElem[e][s.tier] = [];
      byElem[e][s.tier].push(s);
    }
    return byElem;
  }, [skills]);

  // Available elements for this class
  const availableElements = useMemo(() => {
    const elems = [];
    for (const e of ELEMENT_ORDER) {
      if (treeData[e] && Object.keys(treeData[e]).length > 0) elems.push(e);
    }
    if (treeData["none"] && Object.keys(treeData["none"]).length > 0) elems.push("none");
    return elems;
  }, [treeData]);

  // Skills for active element, sorted by tier
  const activeSkills = useMemo(() => {
    const elemData = treeData[activeElement] || {};
    const result = [];
    for (let t = 1; t <= 6; t++) {
      if (elemData[t]) result.push({ tier: t, skills: elemData[t] });
    }
    return result;
  }, [treeData, activeElement]);

  // Count learned per element
  const elemCounts = useMemo(() => {
    const counts = {};
    for (const e of availableElements) {
      const elemSkills = skills.filter(s => (s.element || "none") === e);
      counts[e] = {
        total: elemSkills.length,
        learned: elemSkills.filter(s => learnedSkills.includes(s.id)).length,
      };
    }
    return counts;
  }, [skills, learnedSkills, availableElements]);

  const allSynergies = SKILL_SYNERGIES[charClass] || [];
  const activeSynergies = getActiveSynergies(charClass, learnedSkills, equippedSkills);

  return (
    <div className="p-3 md:p-4 max-w-2xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-orbitron text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Skill Tree
          </h2>
          <p className="text-xs text-muted-foreground capitalize">{charClass} · Lv.{charLevel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
            <Star className="w-3 h-3" /> {skillPoints} SP
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            {learnedSkills.length}/{skills.length}
          </Badge>
        </div>
      </div>

      {/* Skill Hotbar */}
      <SkillHotbar character={character} onCharacterUpdate={onCharacterUpdate} />

      {/* Element Selector - horizontal scrollable pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {availableElements.map(elem => {
          const cfg = ELEMENT_CONFIG[elem] || { icon: "🛡️", label: elem, color: "text-gray-400" };
          const c = elemCounts[elem] || { total: 0, learned: 0 };
          const isActive = activeElement === elem;
          const borderCol = ELEM_BORDER[elem] || "#666";
          return (
            <button
              key={elem}
              onClick={() => { setActiveElement(elem); setSelectedSkill(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={{
                border: `2px solid ${isActive ? borderCol : "transparent"}`,
                background: isActive ? `${borderCol}22` : "rgba(255,255,255,0.04)",
                color: isActive ? borderCol : "#888",
              }}
            >
              <span className="text-sm">{cfg.icon}</span>
              <span>{cfg.label}</span>
              <span style={{ opacity: 0.6 }}>{c.learned}/{c.total}</span>
            </button>
          );
        })}
      </div>

      {/* Skill Tree - Vertical compact layout */}
      <div className="border border-border rounded-xl bg-black/30 p-4 space-y-1">
        {activeSkills.map(({ tier, skills: tierSkills }, tierIdx) => {
          const meta = SKILL_TIERS[tier];
          const tierUnlocked = charLevel >= meta.levelReq;
          return (
            <div key={tier}>
              {/* Tier header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 rounded ${meta.color} ${tierUnlocked ? "opacity-90" : "opacity-40"}`}>
                  T{tier}
                </span>
                <span className={`text-[10px] font-bold ${tierUnlocked ? "text-gray-400" : "text-gray-600"}`}>
                  {meta.label} {!tierUnlocked && `· Lv.${meta.levelReq}`}
                </span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              {/* Skills in this tier - horizontal row */}
              <div className="flex flex-wrap gap-2 justify-center mb-1">
                {tierSkills.map(skill => {
                  const learned = learnedSkills.includes(skill.id);
                  const prereqMet = !skill.requires || learnedSkills.includes(skill.requires);
                  const levelOk = charLevel >= skill.levelReq;
                  const canLearn = !learned && prereqMet && levelOk && skillPoints >= skill.cost;
                  const locked = !prereqMet || !levelOk;
                  const isSelected = selectedSkill?.id === skill.id;
                  const elemColor = ELEM_BORDER[skill.element] || ELEM_BORDER.physical;
                  const elemCfg = skill.element ? ELEMENT_CONFIG[skill.element] : { icon: "🛡️" };

                  return (
                    <motion.div
                      key={skill.id}
                      className="flex flex-col items-center cursor-pointer"
                      style={{ width: 76 }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSkill(isSelected ? null : skill)}
                    >
                      {/* Circular node */}
                      <div
                        className="relative flex items-center justify-center transition-all"
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          border: `3px solid ${learned ? elemColor : canLearn ? "#a78bfa" : locked ? "#333" : "#555"}`,
                          background: learned
                            ? `radial-gradient(circle, ${elemColor}33 0%, ${elemColor}11 100%)`
                            : "radial-gradient(circle, rgba(30,30,40,0.9) 0%, rgba(15,15,20,0.95) 100%)",
                          boxShadow: learned ? ELEM_GLOW[skill.element] || ELEM_GLOW.physical
                            : isSelected ? "0 0 12px rgba(167,139,250,0.5)" : "none",
                          opacity: locked ? 0.35 : 1,
                        }}
                      >
                        <span className="text-xl leading-none">{elemCfg.icon}</span>

                        {/* Status badges */}
                        {learned && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border border-black">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        {!learned && canLearn && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center border border-black animate-pulse">
                            <Star className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        {locked && !learned && (
                          <div className="absolute -top-0.5 -right-0.5">
                            <Lock className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Skill name */}
                      <span className={`text-[9px] font-semibold text-center leading-tight mt-1 line-clamp-2 ${
                        learned ? "text-gray-200" : locked ? "text-gray-600" : "text-gray-400"
                      }`} style={{ maxWidth: 72 }}>
                        {skill.name}
                      </span>

                      {/* Cost */}
                      {!learned && (
                        <span className="text-[8px] text-gray-500 mt-0.5">{skill.cost}SP · {skill.mp}MP</span>
                      )}
                      {learned && (
                        <span className="text-[8px] mt-0.5" style={{ color: elemColor }}>{skill.mp}MP</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Connection line to next tier */}
              {tierIdx < activeSkills.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-px h-4 bg-gray-700" />
                </div>
              )}
            </div>
          );
        })}

        {activeSkills.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No skills available for this element.
          </div>
        )}
      </div>

      {/* Skill Detail Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border rounded-xl bg-card p-4 space-y-2.5"
            style={{ borderColor: `${ELEM_BORDER[selectedSkill.element] || "#555"}66` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {/* Large element icon */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    border: `2px solid ${ELEM_BORDER[selectedSkill.element] || "#666"}`,
                    background: `${ELEM_BORDER[selectedSkill.element] || "#666"}22`,
                  }}
                >
                  <span className="text-xl">
                    {(selectedSkill.element && ELEMENT_CONFIG[selectedSkill.element]?.icon) || "🛡️"}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedSkill.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={SKILL_TIERS[selectedSkill.tier]?.color}>T{selectedSkill.tier} {SKILL_TIERS[selectedSkill.tier]?.label}</span>
                    <span>· Lv.{selectedSkill.levelReq}</span>
                    {selectedSkill.element && <span>· {ELEMENT_CONFIG[selectedSkill.element]?.label}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="p-1 hover:bg-white/5 rounded">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              {selectedSkill.damage > 0 && (
                <span className="flex items-center gap-1 text-orange-400">
                  <Swords className="w-3 h-3" /> {Math.round(selectedSkill.damage * 100)}% DMG
                </span>
              )}
              {selectedSkill.damage === 0 && (
                <span className="flex items-center gap-1 text-blue-300">
                  <Shield className="w-3 h-3" /> Utility
                </span>
              )}
              <span className="text-blue-400">{selectedSkill.mp} MP</span>
              <span className="text-gray-400">{selectedSkill.cooldown}T CD</span>
              <span className="text-amber-300">{selectedSkill.cost} SP</span>
              {selectedSkill.element && ELEMENT_CONFIG[selectedSkill.element]?.stat && (() => {
                const bonus = elemStats[ELEMENT_CONFIG[selectedSkill.element].stat] || 0;
                return bonus > 0 ? (
                  <span className={`font-bold ${ELEMENT_CONFIG[selectedSkill.element].color}`}>
                    +{bonus}% {ELEMENT_CONFIG[selectedSkill.element].label}
                  </span>
                ) : null;
              })()}
            </div>

            {/* Effect badge */}
            {selectedSkill.effect && (
              <div className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                {selectedSkill.effect.type === "shield" && `🛡️ Shield: absorbs ${selectedSkill.effect.value}% max HP for ${selectedSkill.effect.duration} turns`}
                {selectedSkill.effect.type === "dot" && `🔥 DoT: ${selectedSkill.effect.value}% base dmg/turn for ${selectedSkill.effect.duration} turns`}
                {selectedSkill.effect.type === "stun" && `⚡ Stun: enemy skips ${selectedSkill.effect.duration} turn${selectedSkill.effect.duration > 1 ? "s" : ""}`}
                {selectedSkill.effect.type === "slow" && `🌀 Slow: enemy takes 50% more dmg for ${selectedSkill.effect.duration} turn${selectedSkill.effect.duration > 1 ? "s" : ""}`}
                {selectedSkill.effect.type === "buff" && `✨ Buff: +${selectedSkill.effect.value}% ${selectedSkill.effect.stat} for ${selectedSkill.effect.duration} turns`}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{selectedSkill.description}</p>

            {selectedSkill.synergy && (
              <p className="text-xs text-primary/70 italic">💡 {selectedSkill.synergy}</p>
            )}

            {/* Prerequisites */}
            {selectedSkill.requires && (() => {
              const prereq = skills.find(s => s.id === selectedSkill.requires);
              const met = learnedSkills.includes(selectedSkill.requires);
              return (
                <p className="text-xs">
                  Requires: <span className={met ? "text-green-400" : "text-red-400"}>{prereq?.name || selectedSkill.requires}</span>
                </p>
              );
            })()}

            {/* Learn button */}
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
                <Button
                  size="sm"
                  className="w-full h-8 text-xs gap-1 bg-violet-600 hover:bg-violet-500 text-white"
                  onClick={() => learnMutation.mutate(selectedSkill)}
                  disabled={learnMutation.isPending}
                >
                  <Zap className="w-3 h-3" /> Learn Skill — {selectedSkill.cost} SP
                </Button>
              );
              return null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Synergies */}
      {allSynergies.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-sm text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Skill Synergies
            </h3>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              {activeSynergies.length}/{allSynergies.length}
            </Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {allSynergies.map(syn => {
              const isActive = activeSynergies.some(a => a.id === syn.id);
              const learnedSet = new Set(learnedSkills);
              const progress = syn.requires.filter(id => learnedSet.has(id)).length;
              return (
                <div
                  key={syn.id}
                  className={`border rounded-lg p-2.5 ${
                    isActive ? "border-amber-500/50 bg-amber-500/10" : "border-gray-700/50 bg-gray-800/20 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{syn.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-bold truncate ${isActive ? "text-amber-300" : "text-gray-500"}`}>{syn.name}</p>
                    </div>
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <span className="text-[9px] text-gray-600 shrink-0">{progress}/{syn.requires.length}</span>}
                  </div>
                  <p className={`text-[9px] ${isActive ? "text-amber-200/80" : "text-gray-600"}`}>{syn.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Element Stack Bonuses */}
      {(() => {
        const { activeStacks } = getElementStackBonuses(charClass, equippedSkills);
        const ELEM_EMOJIS = { fire: "🔥", ice: "❄️", lightning: "⚡", poison: "☠️", blood: "🩸", sand: "🌪️" };
        const ELEM_COLORS = { fire: "text-orange-400", ice: "text-cyan-400", lightning: "text-yellow-300", poison: "text-green-400", blood: "text-red-400", sand: "text-amber-400" };
        const allElements = Object.keys(ELEMENT_STACK_BONUSES);
        return (
          <div className="border border-violet-500/30 bg-violet-500/5 rounded-xl p-4 space-y-3">
            <h3 className="font-orbitron font-bold text-sm text-violet-400 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Element Stacks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allElements.map(element => {
                const tiers = ELEMENT_STACK_BONUSES[element];
                const activeStack = activeStacks.find(s => s.element === element);
                const activeTier = activeStack?.tier || 0;
                return (
                  <div key={element} className={`border rounded-lg p-2 ${activeTier > 0 ? "border-white/10 bg-white/5" : "border-gray-800 bg-gray-900/30 opacity-50"}`}>
                    <p className={`text-[10px] font-bold mb-1 ${ELEM_COLORS[element] || "text-gray-400"}`}>{ELEM_EMOJIS[element]} {element.charAt(0).toUpperCase() + element.slice(1)}</p>
                    {[2, 3, 4].map(tier => {
                      const bonus = tiers[tier];
                      if (!bonus) return null;
                      const isActive = activeTier >= tier;
                      const bonusStr = Object.entries(bonus).map(([k, v]) => `+${v}% ${k.replace(/_/g, " ")}`).join(", ");
                      return (
                        <p key={tier} className={`text-[9px] ${isActive ? ELEM_COLORS[element] : "text-gray-600"}`}>
                          {isActive ? "✓" : "○"} {tier}x: {bonusStr}
                        </p>
                      );
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
