import React, { useState, useEffect, useRef } from "react";
import { idleEngine } from "@/lib/idleEngine";
import { Swords, Pickaxe, Gem, Clock } from "lucide-react";

export default function IdleStatusBar({ character }) {
  const [fightResult, setFightResult] = useState(null);
  const [lifeSkillResult, setLifeSkillResult] = useState(null);
  const [gemLabResult, setGemLabResult] = useState(null);
  const [shopTimer, setShopTimer] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const clearTimers = () => timersRef.current.forEach(t => clearTimeout(t));

    const unsubs = [
      idleEngine.on('fightResult', (data) => {
        setFightResult(data);
        const t = setTimeout(() => setFightResult(null), 3000);
        timersRef.current.push(t);
      }),
      idleEngine.on('lifeSkillTick', (data) => {
        setLifeSkillResult(data);
        const t = setTimeout(() => setLifeSkillResult(null), 3000);
        timersRef.current.push(t);
      }),
      idleEngine.on('gemLabTick', (data) => {
        setGemLabResult(data);
        const t = setTimeout(() => setGemLabResult(null), 5000);
        timersRef.current.push(t);
      }),
      idleEngine.on('shopRotation', (data) => {
        setShopTimer(data.timeLeftFormatted);
      }),
    ];
    return () => { unsubs.forEach(u => u()); clearTimers(); };
  }, []);

  const activeSkill = (() => {
    const ls = character?.life_skills || {};
    for (const s of ['mining', 'fishing', 'herbalism']) {
      if (ls[s]?.is_active) return s;
    }
    return null;
  })();

  const isIdleFighting = character?.idle_mode && !idleEngine.isFightPaused();

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-card/60 border-b border-border/50 text-xs overflow-x-auto">
      <div className={`flex items-center gap-1 ${isIdleFighting ? 'text-red-400' : 'text-muted-foreground'}`}>
        <Swords className="w-3 h-3" />
        <span>{isIdleFighting ? 'Fighting' : 'Idle'}</span>
        {fightResult && (
          <span className="text-green-400 ml-1">+{fightResult.rewards?.exp}xp +{fightResult.rewards?.gold}g</span>
        )}
      </div>

      <div className="w-px h-3 bg-border" />

      <div className={`flex items-center gap-1 ${activeSkill ? 'text-blue-400' : 'text-muted-foreground'}`}>
        <Pickaxe className="w-3 h-3" />
        <span>{activeSkill ? `${activeSkill.charAt(0).toUpperCase() + activeSkill.slice(1)}` : 'No skill'}</span>
        {lifeSkillResult && lifeSkillResult.resources?.length > 0 && (
          <span className="text-green-400 ml-1">+{lifeSkillResult.resources.length} drop</span>
        )}
      </div>

      <div className="w-px h-3 bg-border" />

      <div className="flex items-center gap-1 text-purple-400">
        <Gem className="w-3 h-3" />
        <span>Lab</span>
        {gemLabResult && gemLabResult.gemsGenerated > 0.001 && (
          <span className="text-green-400 ml-1">+{gemLabResult.gemsGenerated.toFixed(3)}</span>
        )}
      </div>

      <div className="w-px h-3 bg-border" />

      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Shop: {shopTimer || '...'}</span>
      </div>
    </div>
  );
}
