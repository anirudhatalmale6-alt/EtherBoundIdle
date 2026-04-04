import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Swords, Skull, Coins, Star, Play, LogOut, LogIn,
  Shield, Zap, Heart, Users, Crown, Sparkles,
  Crosshair, Flame, Snowflake, Droplets, Wind,
  ArrowRight, AlertTriangle, ShieldCheck, RefreshCw,
  ChevronUp, ChevronDown, Gem,
} from "lucide-react";
import { CLASS_SKILLS, ELEMENT_CONFIG } from "@/lib/skillData";
import HealthBar from "@/components/game/HealthBar";
import { useSmartPolling, POLL_INTERVALS } from "@/hooks/useSmartPolling";

const ELEMENT_ICONS = {
  fire: Flame, ice: Snowflake, lightning: Zap, poison: Droplets,
  blood: Heart, sand: Wind, neutral: Star,
};
const ELEMENT_COLORS = {
  fire: "text-orange-400", ice: "text-cyan-400", lightning: "text-yellow-400",
  poison: "text-green-400", blood: "text-red-400", sand: "text-amber-400", neutral: "text-gray-400",
};
const ELEMENT_BG = {
  fire: "from-orange-900/40 to-red-900/30",
  ice: "from-cyan-900/40 to-blue-900/30",
  lightning: "from-yellow-900/40 to-amber-900/30",
  poison: "from-green-900/40 to-emerald-900/30",
  blood: "from-red-900/40 to-rose-900/30",
  sand: "from-amber-900/40 to-yellow-900/30",
  neutral: "from-gray-900/40 to-slate-900/30",
};

// ─── Field Combat ─────────────────────────────────────────────────────────
function FieldCombat({ session: initialSession, character, onLeave }) {
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [autoFight, setAutoFight] = useState(false);
  const autoFightRef = useRef(false);
  const logRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const combatPollInterval = useSmartPolling(POLL_INTERVALS.COMBAT);

  useEffect(() => { autoFightRef.current = autoFight; }, [autoFight]);
  useEffect(() => { setSession(initialSession); }, [initialSession]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [session?.combatLog?.length]);

  const doAction = useCallback(async (actionType, extra = {}) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("fieldAction", {
        characterId: character.id,
        action: actionType,
        sessionId: session.id,
        ...extra,
      });
      if (res?.session) setSession(res.session);
      if (res?.success === false && res?.error) {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [loading, session?.id, character?.id, toast]);

  // Auto-attack
  useEffect(() => {
    if (!autoFight || session?.status !== "combat") return;
    const iv = setInterval(() => {
      if (!autoFightRef.current) return;
      const aliveEnemy = (session?.enemies || []).find(e => e.hp > 0);
      if (aliveEnemy) {
        doAction("attack", { targetEnemyId: selectedTarget || aliveEnemy.id });
      }
    }, 1200);
    return () => clearInterval(iv);
  }, [autoFight, session?.status, session?.enemies, selectedTarget, doAction]);

  // Polling
  useEffect(() => {
    if (!session?.id) return;
    const iv = setInterval(async () => {
      try {
        const res = await base44.functions.invoke("fieldAction", {
          characterId: character.id, action: "poll", sessionId: session.id,
        });
        if (res?.session) setSession(res.session);
      } catch {}
    }, combatPollInterval || 5000);
    return () => clearInterval(iv);
  }, [session?.id, character?.id, combatPollInterval]);

  const me = (session?.members || []).find(m => m.characterId === character.id || m.character_id === character.id);
  const enemies = session?.enemies || [];
  const members = session?.members || [];
  const modifiers = session?.modifiers || [];
  const combatLog = session?.combatLog || [];
  const element = session?.element || "neutral";
  const ElemIcon = ELEMENT_ICONS[element] || Star;
  const elemColor = ELEMENT_COLORS[element] || "text-gray-400";
  const isDefeated = session?.status === "defeated";
  const isFieldClear = session?.status === "field_clear";
  const pendingPath = session?.data?.pendingPathChoice;
  const rewards = session?.rewards || {};
  const mySkills = CLASS_SKILLS[character?.class] || [];

  const handleLeave = async () => {
    await doAction("leave");
    queryClient.invalidateQueries(["character"]);
    onLeave();
  };

  // Defeat screen
  if (isDefeated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-b from-red-900/50 to-gray-900/80 border border-red-500/50 rounded-2xl p-6 max-w-lg w-full text-center space-y-4">
          <Skull className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-red-400">Defeated on Field {session?.fieldNumber}</h2>
          <p className="text-muted-foreground">Your party has fallen. Here are your total rewards:</p>
          <div className="bg-black/30 rounded-xl p-4 space-y-2 text-left">
            {rewards.gold > 0 && <div className="flex justify-between"><span className="text-yellow-400">Gold</span><span>+{rewards.gold.toLocaleString()}</span></div>}
            {rewards.exp > 0 && <div className="flex justify-between"><span className="text-blue-400">EXP</span><span>+{rewards.exp.toLocaleString()}</span></div>}
            {rewards.dublons > 0 && <div className="flex justify-between"><span className="text-purple-400">Dublons</span><span>+{rewards.dublons}</span></div>}
            {rewards.crystals > 0 && <div className="flex justify-between"><span className="text-cyan-400">Crystals</span><span>+{rewards.crystals}</span></div>}
            {rewards.ascension_shards > 0 && <div className="flex justify-between"><span className="text-amber-400">Ascension Shards</span><span>+{rewards.ascension_shards}</span></div>}
            {rewards.celestial_stones > 0 && <div className="flex justify-between"><span className="text-pink-400">Celestial Stones</span><span>+{rewards.celestial_stones}</span></div>}
            {rewards.incubators > 0 && <div className="flex justify-between"><span className="text-green-400">Incubators</span><span>+{rewards.incubators}</span></div>}
            {rewards.sqrizzscrolls > 0 && <div className="flex justify-between"><span className="text-orange-400">Sqrizzscrolls</span><span>+{rewards.sqrizzscrolls}</span></div>}
            {rewards.boss_stones > 0 && <div className="flex justify-between"><span className="text-red-400">Boss Stones</span><span>+{rewards.boss_stones}</span></div>}
            {(rewards.loot || []).length > 0 && <div className="pt-2 border-t border-white/10"><span className="text-amber-300 text-sm font-semibold">Loot:</span> {rewards.loot.join(", ")}</div>}
          </div>
          <Button onClick={handleLeave} className="bg-red-600 hover:bg-red-700 w-full">Leave The Fields</Button>
        </motion.div>
      </div>
    );
  }

  // Path choice screen
  if (isFieldClear && pendingPath) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-b from-green-900/30 to-gray-900/80 border border-green-500/40 rounded-2xl p-6 max-w-lg w-full text-center space-y-4">
          <Sparkles className="w-12 h-12 text-green-400 mx-auto" />
          <h2 className="text-xl font-bold text-green-400">Field {session?.fieldNumber} Cleared!</h2>
          <p className="text-muted-foreground text-sm">Choose your path to the next field:</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => doAction("choose_path", { pathChoice: "safe" })} disabled={loading} className="p-4 rounded-xl bg-blue-600/20 border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-600/30 transition-all text-center space-y-2 cursor-pointer">
              <ShieldCheck className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="font-bold text-blue-400">Safe Path</p>
              <p className="text-xs text-muted-foreground">Fewer enemies, standard modifiers</p>
            </button>
            <button onClick={() => doAction("choose_path", { pathChoice: "risk" })} disabled={loading} className="p-4 rounded-xl bg-red-600/20 border-2 border-red-500/50 hover:border-red-400 hover:bg-red-600/30 transition-all text-center space-y-2 cursor-pointer">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="font-bold text-red-400">Risk Path</p>
              <p className="text-xs text-muted-foreground">More elites, better rewards + extra buffs</p>
            </button>
          </div>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">Rewards so far: {rewards.dublons || 0} Dublons, {rewards.gold || 0} Gold, {rewards.exp || 0} EXP</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-[80vh] bg-gradient-to-b ${ELEMENT_BG[element] || ELEMENT_BG.neutral} p-2 space-y-2`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-black/40 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <ElemIcon className={`w-5 h-5 ${elemColor}`} />
          <span className="font-bold text-sm">Field {session?.fieldNumber}</span>
          <Badge variant="outline" className={`${elemColor} border-current text-xs`}>{element}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-purple-400 border-purple-500/50 text-xs">{rewards.dublons || 0} Dublons</Badge>
          <Button size="sm" variant={autoFight ? "destructive" : "outline"} onClick={() => setAutoFight(!autoFight)} className="h-7 text-xs">
            {autoFight ? "Stop" : "Auto"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLeave} className="h-7 text-xs text-red-400 hover:text-red-300">
            <LogOut className="w-3 h-3 mr-1" /> Leave
          </Button>
        </div>
      </div>

      {/* Modifiers bar */}
      <div className="flex gap-1 flex-wrap bg-black/20 rounded-lg px-2 py-1">
        {modifiers.map((mod, i) => (
          <Badge key={i} variant="outline" className={`text-[10px] ${mod.type === "buff" ? "text-green-400 border-green-500/40" : "text-red-400 border-red-500/40"}`} title={mod.description}>
            {mod.type === "buff" ? <ChevronUp className="w-2.5 h-2.5 mr-0.5" /> : <ChevronDown className="w-2.5 h-2.5 mr-0.5" />}
            {mod.name}
          </Badge>
        ))}
      </div>

      {/* Enemies (top section) */}
      <div className="bg-black/30 rounded-xl p-2">
        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Skull className="w-3 h-3" /> Enemies ({enemies.filter(e => e.hp > 0).length}/{enemies.length})</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {enemies.map((enemy, i) => {
            const dead = enemy.hp <= 0;
            const hpPct = enemy.max_hp > 0 ? (enemy.hp / enemy.max_hp * 100) : 0;
            const isSelected = selectedTarget === enemy.id;
            const EIcon = ELEMENT_ICONS[enemy.element] || Star;
            const eColor = ELEMENT_COLORS[enemy.element] || "text-gray-400";
            return (
              <div
                key={enemy.id}
                onClick={() => !dead && setSelectedTarget(enemy.id)}
                className={`relative rounded-lg p-1.5 border cursor-pointer transition-all ${dead ? "opacity-30 border-gray-700" : isSelected ? "border-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500/30" : "border-white/10 hover:border-white/30 bg-black/20"}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <EIcon className={`w-3 h-3 ${eColor}`} />
                  <span className={`text-[10px] font-bold truncate ${dead ? "line-through" : ""} ${enemy.isElite ? "text-yellow-400" : enemy.isBoss ? "text-red-400" : "text-foreground"}`}>
                    {enemy.name}
                  </span>
                </div>
                {enemy.isElite && <Badge className="absolute -top-1 -right-1 text-[7px] px-1 py-0 bg-yellow-600">ELITE</Badge>}
                {enemy.isBoss && <Badge className="absolute -top-1 -right-1 text-[7px] px-1 py-0 bg-red-600">BOSS</Badge>}
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${hpPct > 50 ? "bg-red-500" : hpPct > 25 ? "bg-orange-500" : "bg-red-700"}`} style={{ width: `${hpPct}%` }} />
                </div>
                <p className="text-[9px] text-muted-foreground text-center">{dead ? "DEAD" : `${enemy.hp}/${enemy.max_hp}`}</p>
                {(enemy.attackers || []).length >= 3 && <span className="text-[8px] text-yellow-400">x{enemy.attackers.length} co-op!</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {session?.status === "combat" && me?.alive && me?.hp > 0 && (
        <div className="flex gap-1 flex-wrap bg-black/20 rounded-lg p-2">
          <Button size="sm" onClick={() => doAction("attack", { targetEnemyId: selectedTarget })} disabled={loading} className="bg-red-600 hover:bg-red-700 h-8 text-xs">
            <Swords className="w-3 h-3 mr-1" /> Attack
          </Button>
          {mySkills.slice(0, 6).map(skill => (
            <Button key={skill.id} size="sm" variant="outline" onClick={() => doAction("skill", { skillId: skill.id, targetEnemyId: selectedTarget })} disabled={loading} className="h-8 text-xs" title={skill.description}>
              {skill.name}
            </Button>
          ))}
          {character?.class === "warrior" && (
            <Button size="sm" variant="outline" onClick={() => doAction("aggro")} disabled={loading} className="h-8 text-xs border-orange-500/50 text-orange-400">
              <Shield className="w-3 h-3 mr-1" /> Taunt
            </Button>
          )}
          {character?.class === "mage" && (
            <>
              {members.filter(m => m.characterId !== character.id && m.alive && m.hp > 0 && m.hp < m.max_hp).map(m => (
                <Button key={m.characterId} size="sm" variant="outline" onClick={() => doAction("heal_ally", { targetCharacterId: m.characterId || m.character_id })} disabled={loading} className="h-8 text-xs border-green-500/50 text-green-400">
                  <Heart className="w-3 h-3 mr-1" /> Heal {m.name}
                </Button>
              ))}
            </>
          )}
          {/* Revive dead allies */}
          {members.filter(m => (m.characterId || m.character_id) !== character.id && (!m.alive || m.hp <= 0)).map(m => (
            <Button key={`rev-${m.characterId || m.character_id}`} size="sm" variant="outline" onClick={() => doAction("revive", { targetCharacterId: m.characterId || m.character_id })} disabled={loading} className="h-8 text-xs border-cyan-500/50 text-cyan-400">
              <RefreshCw className="w-3 h-3 mr-1" /> Revive {m.name} {m.reviveTimer > 0 ? `(${m.reviveTimer}/3)` : ""}
            </Button>
          ))}
        </div>
      )}

      {session?.status === "waiting" && (
        <div className="text-center p-4">
          <Button onClick={() => doAction("start")} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" /> Start Battle
          </Button>
        </div>
      )}

      {/* Players (bottom section) */}
      <div className="bg-black/30 rounded-xl p-2">
        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Players ({members.length}/10)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {members.map((m, i) => {
            const isMe = (m.characterId || m.character_id) === character.id;
            const dead = !m.alive || m.hp <= 0;
            const hpPct = m.max_hp > 0 ? (m.hp / m.max_hp * 100) : 0;
            const mpPct = m.max_mp > 0 ? ((m.mp || 0) / m.max_mp * 100) : 0;
            return (
              <div key={m.characterId || m.character_id || i} className={`rounded-lg p-1.5 border transition-all ${dead ? "opacity-50 border-gray-700" : isMe ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-black/20"}`}>
                <div className="flex items-center gap-1 mb-0.5">
                  {isMe && <Crown className="w-3 h-3 text-yellow-400" />}
                  <span className={`text-[10px] font-bold truncate ${dead ? "line-through text-gray-500" : ""}`}>{m.name}</span>
                  <span className="text-[8px] text-muted-foreground">Lv{m.level}</span>
                </div>
                <Badge variant="outline" className="text-[8px] px-1 py-0 mb-0.5">{m.class}</Badge>
                {/* HP bar */}
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-0.5">
                  <div className={`h-full rounded-full transition-all ${hpPct > 50 ? "bg-green-500" : hpPct > 25 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${hpPct}%` }} />
                </div>
                <p className="text-[8px] text-muted-foreground">{dead ? "KO'd" : `${m.hp}/${m.max_hp}`}</p>
                {/* MP bar */}
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${mpPct}%` }} />
                </div>
                {m.reviveTimer > 0 && <p className="text-[8px] text-cyan-400 mt-0.5">Reviving... ({m.reviveTimer}/3)</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Combat Log */}
      <div ref={logRef} className="bg-black/40 rounded-xl p-2 h-32 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-gray-700">
        {combatLog.map((log, i) => (
          <p key={i} className={`text-[10px] ${log.type === "victory" ? "text-green-400 font-bold" : log.type === "defeat" ? "text-red-400 font-bold" : log.type === "player_attack" ? "text-blue-300" : log.type === "enemy_attack" ? "text-red-300" : "text-gray-400"}`}>
            {log.text}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Fields Lobby ─────────────────────────────────────────────────────────
export default function Fields({ character, onCharacterUpdate }) {
  const [activeSession, setActiveSession] = useState(null);
  const [lobbySessions, setLobbySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("fieldAction", {
        characterId: character.id, action: "get_status",
      });
      if (res?.session) { setActiveSession(res.session); setLoading(false); return; }

      const listRes = await base44.functions.invoke("fieldAction", {
        characterId: character.id, action: "list_active",
      });
      setLobbySessions(listRes?.sessions || []);
      setActiveSession(null);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [character?.id, toast]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const enterFields = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("fieldAction", {
        characterId: character.id, action: "enter",
      });
      if (res?.session) setActiveSession(res.session);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const joinSession = async (sessionId) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("fieldAction", {
        characterId: character.id, action: "join", sessionId,
      });
      if (res?.session) setActiveSession(res.session);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading The Fields...</div>
      </div>
    );
  }

  // Active session — show combat
  if (activeSession) {
    return (
      <FieldCombat
        session={activeSession}
        character={character}
        onLeave={() => { setActiveSession(null); fetchStatus(); queryClient.invalidateQueries(["character"]); }}
      />
    );
  }

  // Lobby
  return (
    <div className="min-h-[80vh] p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">The Fields</h1>
          <p className="text-muted-foreground text-sm">Battle endless waves of enemies with up to 10 players. Fight until you fall!</p>
        </motion.div>
      </div>

      {/* Enter Button */}
      <div className="text-center">
        <Button onClick={enterFields} size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-6">
          <Swords className="w-5 h-5 mr-2" /> Enter The Fields
        </Button>
      </div>

      {/* Active Sessions to Join */}
      {lobbySessions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Active Sessions</h2>
          <div className="grid gap-2">
            {lobbySessions.map(s => {
              const EIcon = ELEMENT_ICONS[s.element] || Star;
              return (
                <div key={s.id} className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <EIcon className={`w-5 h-5 ${ELEMENT_COLORS[s.element] || "text-gray-400"}`} />
                    <div>
                      <p className="text-sm font-bold">Field {s.fieldNumber} <Badge variant="outline" className="ml-1 text-[10px]">{s.element}</Badge></p>
                      <p className="text-xs text-muted-foreground">{s.members.map(m => m.name).join(", ")} ({s.memberCount}/{s.maxPlayers})</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => joinSession(s.id)} disabled={s.memberCount >= s.maxPlayers}>
                    <LogIn className="w-3 h-3 mr-1" /> Join
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-1">
          <h3 className="text-sm font-bold text-green-400 flex items-center gap-1"><Shield className="w-4 h-4" /> Class Roles</h3>
          <p className="text-xs text-muted-foreground">Warriors can taunt enemies. Mages can heal allies. Any player can revive KO'd teammates (3 turns).</p>
        </div>
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-1">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-1"><Gem className="w-4 h-4" /> Rewards</h3>
          <p className="text-xs text-muted-foreground">Earn Dublons, Crystals, Sqrizzscrolls, Boss Stones, gold, EXP, and gear. Teamwork on enemies = bonus loot!</p>
        </div>
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-1">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Risk vs Safe</h3>
          <p className="text-xs text-muted-foreground">After each field, choose Risk Path (harder + better rewards) or Safe Path (easier). Fields get harder with more debuffs!</p>
        </div>
      </div>
    </div>
  );
}
