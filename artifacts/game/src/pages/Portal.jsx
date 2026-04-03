import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Swords, Skull, Coins, Star, Gem, Play, Pause, LogOut,
  ArrowUp, Shield, Zap, Heart, ChevronUp, Users, Crown, Sparkles,
} from "lucide-react";
import { CLASS_SKILLS } from "@/lib/skillData";

// ─── HP Bar ─────────────────────────────────────────────────────────────────
function HpBar({ current, max, color = "bg-red-500", label, height = "h-2.5" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div className="space-y-0.5">
      {label && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{Math.ceil(current).toLocaleString()}/{max.toLocaleString()}</span>
        </div>
      )}
      <div className={`${height} bg-black/40 rounded-full overflow-hidden border border-white/5`}>
        <motion.div className={`h-full ${color} rounded-full`} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  );
}

// ─── Portal Combat ──────────────────────────────────────────────────────────
function PortalCombat({ session: initialSession, character, onLeave }) {
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(0);
  const [autoFight, setAutoFight] = useState(false);
  const autoFightRef = useRef(false);
  const logRef = useRef(null);

  useEffect(() => { autoFightRef.current = autoFight; }, [autoFight]);
  useEffect(() => { setSession(initialSession); }, [initialSession]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [session.combat_log?.length]);

  const doAction = useCallback(async (actionType, skillId) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("portalAction", {
        action: actionType,
        characterId: character.id,
        sessionId: session.id,
        skillId,
        targetIndex: selectedTarget,
      });
      if (res?.session) setSession(res.session);
    } finally {
      setLoading(false);
    }
  }, [loading, session.id, character.id, selectedTarget]);

  const doLeave = async () => {
    setAutoFight(false);
    await base44.functions.invoke("portalAction", {
      action: "leave",
      characterId: character.id,
      sessionId: session.id,
    });
    onLeave();
  };

  // Auto-fight: attack every 1.5s
  useEffect(() => {
    if (!autoFight || loading) return;
    if (session.status === "combat") {
      const me = (session.members || []).find(m => m.characterId === character.id);
      if (!me || me.hp <= 0) return;
      const timer = setTimeout(() => {
        if (autoFightRef.current) doAction("attack");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoFight, session, loading, doAction, character.id]);

  // Stop auto on defeat
  useEffect(() => {
    if (session.status === "defeat") setAutoFight(false);
  }, [session.status]);

  const members = session.members || [];
  const me = members.find(m => m.characterId === character.id);
  const enemies = session.enemies || [];
  const inCombat = session.status === "combat";
  const isDefeat = session.status === "defeat";
  const wave = session.wave || 1;
  const portalLevel = session.portalLevel || 1;
  const isBossWave = session.isBossWave;
  const totalRewards = session.totalRewards || {};

  // Skills
  const allClassSkills = CLASS_SKILLS[character?.class || "warrior"] || [];
  const hotbarIds = character?.hotbar_skills?.length > 0
    ? character.hotbar_skills
    : (character?.skills || []);
  const charSkills = hotbarIds
    .map(sid => allClassSkills.find(s => s.id === sid))
    .filter(Boolean)
    .slice(0, 6);

  // Auto-select first alive enemy
  useEffect(() => {
    if (inCombat && enemies.length > 0) {
      const firstAlive = enemies.findIndex(e => e.hp > 0);
      if (firstAlive >= 0 && enemies[selectedTarget]?.hp <= 0) {
        setSelectedTarget(firstAlive);
      }
    }
  }, [enemies, inCombat, selectedTarget]);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-violet-950/40 via-indigo-950/20 to-background backdrop-blur-sm flex flex-col">
      {/* Animated portal background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-violet-500/8 via-indigo-500/4 to-transparent animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-3 border-b border-violet-500/20 bg-black/40">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border-2 border-violet-500/50 flex items-center justify-center">
            <span className="font-orbitron font-bold text-sm text-violet-300">{wave}</span>
          </div>
          <div>
            <span className="font-orbitron font-bold text-lg tracking-wide text-violet-200">Infinite Portal</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-violet-400 border-violet-500/30 bg-violet-500/10">
                Lv.{portalLevel}
              </Badge>
              <Badge variant="outline" className={
                isBossWave ? "text-red-400 border-red-500/30 bg-red-500/10 font-bold" :
                "text-muted-foreground border-border/50"
              }>
                {isBossWave ? "BOSS WAVE" : `Wave ${wave}`}
              </Badge>
              <Badge variant="outline" className={
                inCombat ? "text-green-400 border-green-500/30 bg-green-500/5" :
                isDefeat ? "text-destructive border-destructive/30 bg-destructive/5" : ""
              }>
                {inCombat ? "In Combat" : isDefeat ? "Defeated" : session.status}
              </Badge>
              {members.length > 1 && (
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 bg-cyan-500/5">
                  <Users className="w-3 h-3 mr-0.5" />{members.length}/4
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoFight ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoFight(!autoFight)}
            className={`gap-1.5 text-xs ${autoFight ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-muted-foreground hover:text-emerald-400 border-emerald-500/30"}`}
          >
            {autoFight ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {autoFight ? "Auto ON" : "Auto OFF"}
          </Button>
          <Button variant="ghost" size="sm" onClick={doLeave} className="gap-1 text-muted-foreground hover:text-destructive">
            <LogOut className="w-3.5 h-3.5" /> Leave
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden flex flex-col md:flex-row gap-3 p-3">
        {/* Left: Enemies (top) + Players (bottom) */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          {/* Enemies */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <Skull className="w-3.5 h-3.5" /> Enemies
            </h3>
            {enemies.map((enemy, idx) => {
              const isTarget = selectedTarget === idx;
              const isDead = enemy.hp <= 0;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isDead ? 0.3 : 1, x: 0 }}
                  onClick={() => !isDead && inCombat && setSelectedTarget(idx)}
                  className={`relative overflow-hidden rounded-xl p-3 transition-all ${
                    isDead ? "border border-muted bg-black/20" :
                    isTarget ? "border-2 border-destructive/60 bg-gradient-to-r from-destructive/10 to-black/30 shadow-lg shadow-destructive/10" :
                    "border border-border/50 bg-black/30 cursor-pointer hover:border-destructive/30"
                  }`}
                >
                  {enemy.isBoss && !isDead && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                  )}
                  <div className="relative flex items-center gap-3 mb-1.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      enemy.isBoss
                        ? "bg-gradient-to-br from-red-500/30 to-violet-500/20 border-2 border-red-500/40"
                        : "bg-muted/30 border border-border/50"
                    }`}>
                      <Skull className={`w-5 h-5 ${enemy.isBoss ? "text-red-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${enemy.isBoss ? "text-red-400 font-orbitron" : "text-foreground"}`}>{enemy.name}</p>
                        {isTarget && inCombat && <Badge className="text-[10px] h-4 px-1.5 bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">TARGET</Badge>}
                        {isDead && <Badge variant="destructive" className="text-[10px] h-4 px-1">SLAIN</Badge>}
                      </div>
                    </div>
                    {enemy.element && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/50 text-violet-400">
                        {enemy.element}
                      </Badge>
                    )}
                  </div>
                  <HpBar current={Math.max(0, enemy.hp)} max={enemy.max_hp} color="bg-red-500" height="h-2" />
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-violet-500/20 my-1" />

          {/* Players */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Players
            </h3>
            {members.map((member, idx) => {
              const isMe = member.characterId === character.id;
              const isDead = member.hp <= 0;
              return (
                <div
                  key={member.characterId}
                  className={`rounded-xl p-3 border transition-all ${
                    isDead ? "border-muted bg-black/20 opacity-50" :
                    isMe ? "border-violet-500/40 bg-violet-500/5" :
                    "border-border/30 bg-black/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isMe ? "bg-violet-500/20 border border-violet-500/40" : "bg-muted/20 border border-border/30"
                    }`}>
                      <Swords className={`w-4 h-4 ${isMe ? "text-violet-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isMe ? "text-violet-300" : "text-foreground"}`}>
                        {member.name} {isMe && <span className="text-[10px] text-muted-foreground">(You)</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">{member.class} Lv.{member.level}</p>
                    </div>
                    {isDead && <Badge variant="destructive" className="text-[10px]">KO</Badge>}
                  </div>
                  <HpBar current={Math.max(0, member.hp)} max={member.max_hp} color={isMe ? "bg-violet-500" : "bg-green-500"} label="HP" height="h-2" />
                  {member.max_mp > 0 && (
                    <div className="mt-1">
                      <HpBar current={Math.max(0, member.mp || 0)} max={member.max_mp} color="bg-blue-500" label="MP" height="h-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          {inCombat && me && me.hp > 0 && (
            <div className="space-y-2 pt-2">
              <Button
                onClick={() => doAction("attack")}
                disabled={loading}
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Swords className="w-4 h-4" /> Attack
              </Button>
              {charSkills.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {charSkills.map(skill => (
                    <Button
                      key={skill.id}
                      variant="outline"
                      size="sm"
                      onClick={() => doAction("skill", skill.id)}
                      disabled={loading}
                      className="text-[10px] h-8 border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                    >
                      {skill.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Combat Log */}
        <div className="w-full md:w-80 flex flex-col bg-black/30 border border-violet-500/15 rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-violet-500/15 bg-violet-500/5">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider">Combat Log</h3>
          </div>
          <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1 text-xs max-h-[50vh]">
            {(session.combat_log || []).slice(-50).map((log, i) => (
              <p key={i} className={
                log.type === "player_attack" ? "text-green-400" :
                log.type === "boss_attack" ? "text-red-400" :
                log.type === "heal" ? "text-emerald-400" :
                log.type === "victory" ? "text-yellow-400 font-bold" :
                log.type === "defeat" ? "text-red-500 font-bold" :
                "text-muted-foreground"
              }>
                {log.text}
              </p>
            ))}
          </div>
          {/* Running totals */}
          {(totalRewards.gold > 0 || totalRewards.portalShards > 0) && (
            <div className="px-3 py-2 border-t border-violet-500/15 bg-violet-500/5 text-[10px] text-muted-foreground space-y-0.5">
              <p className="font-bold text-violet-400 uppercase">Run Totals</p>
              <p><Coins className="w-3 h-3 inline mr-0.5 text-yellow-400" />{(totalRewards.gold || 0).toLocaleString()} gold | <Star className="w-3 h-3 inline mr-0.5 text-blue-400" />{(totalRewards.exp || 0).toLocaleString()} exp</p>
              {totalRewards.portalShards > 0 && <p><Gem className="w-3 h-3 inline mr-0.5 text-violet-400" />{totalRewards.portalShards} Portal Shards</p>}
              {totalRewards.loot?.length > 0 && <p><Sparkles className="w-3 h-3 inline mr-0.5 text-amber-400" />{totalRewards.loot.length} items looted</p>}
            </div>
          )}
        </div>
      </div>

      {/* Defeat Modal */}
      <AnimatePresence>
        {isDefeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border-2 border-red-500/40 rounded-2xl p-6 max-w-md w-full mx-4 text-center space-y-4"
            >
              <Skull className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="font-orbitron text-2xl font-bold text-red-400">Portal Collapsed!</h2>
              <p className="text-muted-foreground">
                All players fell on <span className="text-violet-400 font-bold">Wave {session.finalWave || wave}</span>
              </p>
              <div className="bg-black/30 rounded-xl p-4 space-y-2 text-sm text-left">
                <p className="font-bold text-violet-400 text-center mb-2">Run Summary</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Waves Cleared</span><span className="text-violet-300 font-bold">{(session.finalWave || wave) - 1}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gold Earned</span><span className="text-yellow-400">{(totalRewards.gold || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">EXP Earned</span><span className="text-blue-400">{(totalRewards.exp || 0).toLocaleString()}</span></div>
                {totalRewards.portalShards > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Portal Shards</span><span className="text-violet-400">{totalRewards.portalShards}</span></div>
                )}
                {totalRewards.loot?.length > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Items Looted</span><span className="text-amber-400">{totalRewards.loot.length}</span></div>
                )}
              </div>
              <Button onClick={doLeave} className="w-full bg-violet-600 hover:bg-violet-700">
                Return to Portal
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Portal Page ───────────────────────────────────────────────────────
export default function Portal({ character, onCharacterUpdate }) {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portalStatus, refetch } = useQuery({
    queryKey: ["portalStatus", character?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke("portalAction", {
        action: "get_status",
        characterId: character.id,
      });
      return res;
    },
    enabled: !!character?.id,
    refetchInterval: 5000,
  });

  // Resume active session
  useEffect(() => {
    if (portalStatus?.activeSession && !activeSession) {
      setActiveSession(portalStatus.activeSession);
    }
  }, [portalStatus?.activeSession]);

  const portalLevel = portalStatus?.portalLevel || 1;
  const portalShards = portalStatus?.portalShards || 0;
  const highestWave = portalStatus?.highestWave || 0;
  const nextUpgradeCost = portalStatus?.nextUpgradeCost;

  const handleEnter = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("portalAction", {
        action: "enter",
        characterId: character.id,
      });
      if (res?.session) {
        setActiveSession(res.session);
      }
    } catch (err) {
      toast({ title: err.message || "Failed to enter portal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("portalAction", {
        action: "upgrade",
        characterId: character.id,
      });
      if (res?.success) {
        toast({
          title: `Portal upgraded to Lv.${res.newLevel}!`,
          description: res.newLevel >= 100 ? "You have reached the maximum portal level! Mysterious and glorious rewards await..." : `Enemies are now ${(Math.pow(1.25, res.newLevel - 1) * 100).toFixed(0)}% stronger with better loot.`,
        });
        refetch();
        queryClient.invalidateQueries({ queryKey: ["characters"] });
      }
    } catch (err) {
      toast({ title: err.message || "Upgrade failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    setActiveSession(null);
    refetch();
    queryClient.invalidateQueries({ queryKey: ["characters"] });
    queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  // If in combat, show combat screen
  if (activeSession) {
    return <PortalCombat session={activeSession} character={character} onLeave={handleLeave} />;
  }

  const canUpgrade = portalLevel < 100 && nextUpgradeCost && portalShards >= nextUpgradeCost;
  const upgradeProgress = nextUpgradeCost ? Math.min(100, (portalShards / nextUpgradeCost) * 100) : 100;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Infinite Portal
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter the rift and face endless waves of enemies. How far can you go?
        </p>
      </div>

      {/* Portal Visual */}
      <div className="relative mx-auto w-64 h-64">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 animate-pulse" />
        {/* Inner portal */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-purple-900/60 border-2 border-violet-500/40 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(139,92,246,0.15),transparent,rgba(99,102,241,0.15),transparent)] animate-spin" style={{ animationDuration: "8s" }} />
          <div className="relative text-center z-10">
            <p className="font-orbitron text-4xl font-bold text-violet-300">{portalLevel}</p>
            <p className="text-xs text-violet-400/70 uppercase tracking-wider">Portal Level</p>
          </div>
        </div>
        {/* Sparkles */}
        <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-violet-400/60 animate-ping" />
        <div className="absolute bottom-8 left-2 w-1.5 h-1.5 rounded-full bg-indigo-400/60 animate-ping" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-12 left-4 w-1 h-1 rounded-full bg-purple-400/60 animate-ping" style={{ animationDelay: "1s" }} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-violet-500/20 rounded-xl p-4 text-center">
          <Gem className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-violet-300">{portalShards}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Portal Shards</p>
        </div>
        <div className="bg-card border border-amber-500/20 rounded-xl p-4 text-center">
          <Crown className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-300">{highestWave}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Highest Wave</p>
        </div>
        <div className="bg-card border border-indigo-500/20 rounded-xl p-4 text-center">
          <Swords className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-indigo-300">{(Math.pow(1.25, portalLevel - 1) * 100).toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground uppercase">Enemy Power</p>
        </div>
      </div>

      {/* Enter Portal */}
      <Button
        onClick={handleEnter}
        disabled={loading}
        className="w-full h-14 text-lg font-orbitron gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/30 shadow-lg shadow-violet-500/20"
      >
        <Sparkles className="w-5 h-5" />
        Enter Portal
      </Button>

      {/* Upgrade Section */}
      {portalLevel < 100 && (
        <div className="bg-card border border-violet-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <ChevronUp className="w-4 h-4 text-violet-400" />
                Upgrade Portal
                <span className="text-violet-400">Lv.{portalLevel}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-violet-300">Lv.{portalLevel + 1}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enemies become 1.25x stronger. Loot quality and rewards increase.
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Portal Shards</span>
              <span className={portalShards >= nextUpgradeCost ? "text-green-400" : "text-red-400"}>
                {portalShards} / {nextUpgradeCost}
              </span>
            </div>
            <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${upgradeProgress}%` }}
              />
            </div>
          </div>
          <Button
            onClick={handleUpgrade}
            disabled={!canUpgrade || loading}
            variant="outline"
            className="w-full gap-2 border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40"
          >
            <ArrowUp className="w-4 h-4" />
            Upgrade ({nextUpgradeCost} Shards)
          </Button>
        </div>
      )}

      {/* Max Level Banner */}
      {portalLevel >= 100 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center space-y-2">
          <Crown className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-orbitron text-lg font-bold text-amber-300">Portal Level 100 - Maximum Power!</h3>
          <p className="text-sm text-amber-400/80">
            Mysterious and glorious rewards are awaiting those who dare to push beyond...
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-card/50 border border-border/30 rounded-xl p-4 text-xs text-muted-foreground space-y-1.5">
        <p className="font-bold text-foreground text-sm mb-2">How it works</p>
        <p>- Enemies spawn infinitely, getting stronger each wave</p>
        <p>- When you die, the portal records your highest wave</p>
        <p>- Rewards: Gold, EXP, Magic Dust, Portal Shards, and rare gear</p>
        <p>- Use Portal Shards to upgrade the portal (stronger enemies = better loot)</p>
        <p>- Up to 4 party members can fight together</p>
        <p>- Boss waves appear every 10 waves with guaranteed shard drops</p>
        {portalLevel >= 100 && <p className="text-amber-400">- At Lv.100, the most powerful enemies and rarest gear await!</p>}
      </div>
    </div>
  );
}
