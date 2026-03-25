import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Crown, LogOut, X, ChevronDown, ChevronUp, Check, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import PlayerProfileModal from "@/components/game/PlayerProfileModal";

const CLASS_COLORS = {
  warrior: "text-red-400", mage: "text-blue-400",
  ranger: "text-green-400", rogue: "text-purple-400"
};

export default function PartyPanel({ character }) {
  const [expanded, setExpanded] = useState(false);
  const [inviteTarget, setInviteTarget] = useState("");
  const [profileTarget, setProfileTarget] = useState(null);
  const [liveLevels, setLiveLevels] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partyData, refetch: refetchParty } = useQuery({
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

  // Refresh live levels for all party members from DB
  useEffect(() => {
    if (!partyData?.members?.length) return;
    const fetchLevels = async () => {
      const updates = {};
      await Promise.all(partyData.members.map(async (m) => {
        try {
          const chars = await base44.entities.Character.filter({ id: m.character_id });
          if (chars[0]) updates[m.character_id] = chars[0].level;
        } catch {}
      }));
      setLiveLevels(updates);
    };
    fetchLevels();
    const interval = setInterval(fetchLevels, 15000);
    return () => clearInterval(interval);
  }, [partyData?.id, partyData?.members?.length]);

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

  // Don't render party UI if player not in party or party is disbanded
  const isPlayerInParty = partyData && partyData.status !== 'disbanded' && partyData.members?.some(m => m.character_id === character.id);
  if (!isPlayerInParty) {
    return (
      <div className="fixed bottom-20 right-3 z-30 w-56">
        <AnimatePresence>
          {pendingInvites.map(inv => (
            <motion.div key={inv.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mb-2 bg-card border border-primary/50 rounded-xl p-3 shadow-lg">
              <p className="text-xs font-semibold text-primary mb-1">Party Invite!</p>
              <p className="text-xs text-muted-foreground mb-2">{inv.from_name} invites you</p>
              <div className="flex gap-1.5">
                <Button size="sm" className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleAccept(inv)}><Check className="w-3 h-3" /> Accept</Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleDecline(inv)}><X className="w-3 h-3" /> Decline</Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  const isLeader = partyData?.leader_id === character.id;
  const memberCount = partyData?.members?.length || 0;
  const expBonus = memberCount > 1 ? (memberCount - 1) * 5 : 0;

  const handleCreate = () => mutation.mutate({ action: 'create' });
  const handleLeave = () => mutation.mutate({ action: 'leave', partyId: partyData.id });

  const handleInvite = () => {
    if (!inviteTarget.trim()) return;
    const payload = { action: 'invite', partyId: partyData.id };
    // Pass both so the backend can try ID first, then name
    if (inviteTarget.includes('-')) {
      payload.targetCharacterId = inviteTarget;
    } else {
      payload.targetName = inviteTarget;
      payload.targetCharacterId = inviteTarget; // backend will try name lookup if ID fails
    }
    mutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: `Invite sent to "${inviteTarget}"!`, duration: 2000 });
        setInviteTarget("");
      },
    });
  };

  const handleAccept = (invite) => mutation.mutate({ action: 'accept', inviteId: invite.id });
  const handleDecline = (invite) => mutation.mutate({ action: 'decline', inviteId: invite.id });

  return (
    <>
    {profileTarget && profileTarget.character_id !== character.id && (
      <PlayerProfileModal
        characterId={profileTarget.character_id}
        characterName={profileTarget.name}
        onClose={() => setProfileTarget(null)}
        onInviteToParty={partyData && isLeader ? () => {
          mutation.mutate({ action: 'invite', partyId: partyData.id, targetCharacterId: profileTarget.character_id });
          setProfileTarget(null);
        } : undefined}
      />
    )}
    <div className="fixed bottom-20 right-3 z-30 w-56">
      {/* Pending invites */}
      <AnimatePresence>
        {pendingInvites.map(inv => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-2 bg-card border border-primary/50 rounded-xl p-3 shadow-lg"
          >
            <p className="text-xs font-semibold text-primary mb-1">Party Invite!</p>
            <p className="text-xs text-muted-foreground mb-2">{inv.from_name} invites you</p>
            <div className="flex gap-1.5">
              <Button size="sm" className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleAccept(inv)}>
                <Check className="w-3 h-3" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleDecline(inv)}>
                <X className="w-3 h-3" /> Decline
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Party panel */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Party</span>
            {memberCount > 0 && (
              <Badge className="bg-primary/20 text-primary text-xs h-5">{memberCount}/6</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {expBonus > 0 && <span className="text-xs text-accent">+{expBonus}% EXP</span>}
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
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
                {!partyData ? (
                  <Button size="sm" className="w-full h-7 text-xs gap-1" onClick={handleCreate} disabled={mutation.isPending}>
                    <UserPlus className="w-3 h-3" /> Create Party
                  </Button>
                ) : (
                  <>
                    <div className="space-y-1">
                      {partyData.members?.map(m => {
                        const displayLevel = liveLevels[m.character_id] ?? m.level;
                        return (
                          <div
                            key={m.character_id}
                            className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/40 rounded p-1 -mx-1 transition-colors"
                            onClick={() => setProfileTarget(m)}
                          >
                            {m.character_id === partyData.leader_id && <Crown className="w-3 h-3 text-accent flex-shrink-0" />}
                            <span className={`font-medium truncate ${CLASS_COLORS[m.class] || "text-foreground"}`}>
                              {m.name}
                            </span>
                            <span className="text-muted-foreground ml-auto">Lv.{displayLevel}</span>
                            <User className="w-2.5 h-2.5 text-muted-foreground/50" />
                          </div>
                        );
                      })}
                    </div>

                    {expBonus > 0 && (
                      <div className="bg-primary/10 rounded-lg p-2 text-xs text-primary">
                        +{expBonus}% EXP & Gold bonus
                      </div>
                    )}

                    {isLeader && memberCount < 6 && (
                      <div className="flex gap-1">
                        <input
                          value={inviteTarget}
                          onChange={e => setInviteTarget(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleInvite()}
                          placeholder="Name or ID..."
                          className="flex-1 text-xs bg-muted border border-border rounded px-2 py-1 outline-none focus:border-primary"
                        />
                        <Button size="sm" className="h-6 text-xs px-2" onClick={handleInvite} disabled={mutation.isPending}>
                          <UserPlus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={handleLeave}>
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