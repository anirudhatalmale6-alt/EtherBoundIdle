import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Shield, Star, User, UserMinus, ChevronUp, ChevronDown } from "lucide-react";

const ROLES = ["leader", "co-leader", "officer", "member"];
const ROLE_ICONS = { leader: Crown, "co-leader": Star, officer: Shield, member: User };
const ROLE_COLORS = {
  leader: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  "co-leader": "text-purple-400 bg-purple-500/20 border-purple-500/30",
  officer: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  member: "text-gray-400 bg-gray-500/20 border-gray-500/30",
};

const canManage = (myRole) => ["leader", "co-leader", "officer"].includes(myRole);

export default function GuildMembers({ guild, myRole, characterId, onKick, onPromote, onDemote }) {
  const members = guild.members || [];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">{members.length} / {guild.max_members || 20} members</p>
      {members.map((m) => {
        const Icon = ROLE_ICONS[m.role] || User;
        const isMe = m.character_id === characterId;
        const canEditThisMember = canManage(myRole) && !isMe && m.role !== "leader";
        return (
          <div key={m.character_id} className="bg-muted/40 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${ROLE_COLORS[m.role]?.split(" ")[0]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{m.name} {isMe && <span className="text-xs text-muted-foreground">(You)</span>}</p>
              <p className="text-xs text-muted-foreground">
                DMG Today: <span className="text-red-400">{(m.boss_damage_today || 0).toLocaleString()}</span>
              </p>
            </div>
            <Badge className={`text-xs capitalize ${ROLE_COLORS[m.role]}`}>{m.role}</Badge>
            {canEditThisMember && (
              <div className="flex gap-1">
                {myRole === "leader" && m.role !== "co-leader" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Promote" onClick={() => onPromote(m)}>
                    <ChevronUp className="w-3.5 h-3.5 text-green-400" />
                  </Button>
                )}
                {myRole === "leader" && m.role !== "member" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Demote" onClick={() => onDemote(m)}>
                    <ChevronDown className="w-3.5 h-3.5 text-yellow-400" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Kick" onClick={() => onKick(m)}>
                  <UserMinus className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
      {members.length === 0 && <p className="text-center py-6 text-muted-foreground text-sm">No members yet.</p>}
    </div>
  );
}