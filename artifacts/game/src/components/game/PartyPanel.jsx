import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Crown, LogOut, X, ChevronDown, ChevronRight, Check, User, MapPin, Swords } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import PlayerProfileModal from "@/components/game/PlayerProfileModal";
import { REGIONS } from "@/lib/gameData";

const CLASS_COLORS = {
  warrior: "text-red-400", mage: "text-blue-400",
  ranger: "text-green-400", rogue: "text-purple-400"
};

const CLASS_ICONS = {
  warrior: "⚔️", mage: "🔮", ranger: "🏹", rogue: "🗡️"
};

export default function PartyPanel({ character }) {
  const [expanded, setExpanded] = useState(true);
  const [inviteTarget, setInviteTarget] = useState("");
  const [profileTarget, setProfileTarget] = useState(null);
  const [liveLevels, setLiveLevels] = useState({});
  const [memberDetails, setMemberDetails] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partyData } = useQuery({
    queryKey: ["party", character?.id],
    queryFn: async () => {
      const led = await base44.entities.Party.filter({ leader_id: character.id });
      const active = led.find(p => p.status !== 'disbanded');
      if (active) return active;
      const all = await base44.entities.Party.list('-updated_date', 50);
      return all.find(p => p.status !== 'disbanded' && p.members?.some(m => m.character_id === character.id)) || null;
    },
    enabled: !!character?.id,
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (!partyData?.members?.length) return;
    const fetchDetails = async () => {
      const updates = {};
      const levels = {};
      await Promise.all(partyData.members.map(async (m) => {
        try {
          const chars = await base44.entities.Character.filter({ id: m.character_id });
          if (chars[0]) {
            levels[m.character_id] = chars[0].level;
            updates[m.character_id] = {
              level: chars[0].level,
              current_region: chars[0].current_region,
              class: chars[0].class,
            };
          }
        } catch {}
      }));
      setLiveLevels(levels);
      setMemberDetails(updates);
    };
    fetchDetails();
    const interval = setInterval(fetchDetails, 15000);
    return () => clearInterval(interval);
  }, [partyData?.id, partyData?.members?.map(m => m.character_id).sort().join(',')]);

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["partyInvites", character?.id],
    queryFn: () => base44.entities.PartyInvite.filter({ to_character_id: character.id, status: 'pending' }),
    enabled: !!character?.id,
    refetchInterval: 5000,
  });

  const mutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke("manageParty", { characterId: character.id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["partyInvites"] });
    },
    onError: (e) => {
      const msg = e?.response?.data?.error || e.message || "Action failed";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const isPlayerInParty = partyData && partyData.status !== 'disbanded' && partyData.members?.some(m => m.character_id === character.id);
  const isLeader = partyData?.leader_id === character.id;
  const memberCount = isPlayerInParty ? (partyData?.members?.length || 0) : 0;
  const expBonus = memberCount > 1 ? (memberCount - 1) * 5 : 0;
  const goldBonus = memberCount > 1 ? (memberCount - 1) * 10 : 0;

  const handleCreate = () => mutation.mutate({ action: 'create' });
  const handleLeave = () => mutation.mutate({ action: 'leave', partyId: partyData.id });
  const handleAccept = (invite) => mutation.mutate({ action: 'accept', inviteId: invite.id });
  const handleDecline = (invite) => mutation.mutate({ action: 'decline', inviteId: invite.id });

  const handleInvite = () => {
    if (!inviteTarget.trim()) return;
    const payload = { action: 'invite', partyId: partyData.id };
    if (inviteTarget.includes('-')) {
      payload.targetCharacterId = inviteTarget;
    } else {
      payload.targetName = inviteTarget;
      payload.targetCharacterId = inviteTarget;
    }
    mutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: `Invite sent to "${inviteTarget}"!`, duration: 2000 });
        setInviteTarget("");
      },
    });
  };

  const getZoneName = (regionKey) => {
    if (!regionKey) return "Unknown";
    const r = REGIONS[regionKey];
    return r ? r.name : regionKey;
  };

  return (
    <>
      {profileTarget && profileTarget.character_id !== character.id && (
        <PlayerProfileModal
          characterId={profileTarget.character_id}
          characterName={profileTarget.name}
          onClose={() => setProfileTarget(null)}
          onInviteToParty={isPlayerInParty && isLeader ? () => {
            mutation.mutate({ action: 'invite', partyId: partyData.id, targetCharacterId: profileTarget.character_id });
            setProfileTarget(null);
          } : undefined}
        />
      )}

      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30 w-60">
        <AnimatePresence>
          {pendingInvites.map(inv => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="mb-2 bg-card border border-primary/50 rounded-xl p-3 shadow-lg shadow-primary/10"
            >
              <p className="text-xs font-semibold text-primary mb-1">Party Invite!</p>
              <p className="text-xs text-muted-foreground mb-2">{inv.from_name} invites you</p>
              <div className="flex gap-1.5">
                <Button size="sm" className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleAccept(inv)}>
                  <Check className="w-3 h-3 mr-1" /> Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleDecline(inv)}>
                  <X className="w-3 h-3 mr-1" /> Decline
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Party</span>
              {isPlayerInParty && memberCount > 0 && (
                <Badge className="bg-primary/20 text-primary text-xs h-5">{memberCount}/6</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {expBonus > 0 && <span className="text-[10px] text-accent">+{expBonus}%XP +{goldBonus}%G</span>}
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
                  {!isPlayerInParty ? (
                    <>
                      <p className="text-xs text-muted-foreground text-center py-1">No party yet</p>
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs gap-1.5 bg-primary hover:bg-primary/80"
                        onClick={handleCreate}
                        disabled={mutation.isPending}
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Create Party
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">
                        Earn +5% XP & +10% Gold per member
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        {partyData.members?.map(m => {
                          const details = memberDetails[m.character_id] || {};
                          const displayLevel = liveLevels[m.character_id] ?? m.level;
                          const memberClass = details.class || m.class;
                          const memberZone = details.current_region;
                          const isCurrentPlayer = m.character_id === character.id;
                          const isSameZone = memberZone === character.current_region;

                          return (
                            <div
                              key={m.character_id}
                              className={`flex flex-col gap-0.5 text-xs cursor-pointer hover:bg-muted/40 rounded-lg p-1.5 -mx-1 transition-colors ${isCurrentPlayer ? 'bg-primary/5 border border-primary/20' : ''}`}
                              onClick={() => !isCurrentPlayer && setProfileTarget(m)}
                            >
                              <div className="flex items-center gap-1.5">
                                {m.character_id === partyData.leader_id && <Crown className="w-3 h-3 text-accent flex-shrink-0" />}
                                <span className="text-sm">{CLASS_ICONS[memberClass] || "⚔️"}</span>
                                <span className={`font-medium truncate ${CLASS_COLORS[memberClass] || "text-foreground"}`}>
                                  {m.name}
                                </span>
                                <span className="text-muted-foreground ml-auto text-[11px]">Lv.{displayLevel}</span>
                              </div>
                              {memberZone && (
                                <div className="flex items-center gap-1 pl-5">
                                  <MapPin className={`w-2.5 h-2.5 ${isSameZone ? 'text-green-400' : 'text-muted-foreground/50'}`} />
                                  <span className={`text-[10px] truncate ${isSameZone ? 'text-green-400' : 'text-muted-foreground/60'}`}>
                                    {getZoneName(memberZone)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {expBonus > 0 && (
                        <div className="bg-primary/10 rounded-lg p-2 text-xs text-primary flex items-center gap-1.5">
                          <Swords className="w-3 h-3 flex-shrink-0" />
                          +{expBonus}% EXP · +{goldBonus}% Gold
                        </div>
                      )}

                      {isLeader && memberCount < 6 && (
                        <div className="flex gap-1">
                          <input
                            value={inviteTarget}
                            onChange={e => setInviteTarget(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleInvite()}
                            placeholder="Invite by name..."
                            className="flex-1 text-xs bg-muted border border-border rounded px-2 py-1.5 outline-none focus:border-primary transition-colors"
                          />
                          <Button size="sm" className="h-7 text-xs px-2" onClick={handleInvite} disabled={mutation.isPending}>
                            <UserPlus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={handleLeave}
                      >
                        <LogOut className="w-3 h-3" /> Leave Party
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
