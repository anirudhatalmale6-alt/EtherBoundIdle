import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, TrendingUp, Zap, Shield, Gem } from "lucide-react";

const SHOP_ITEMS = [
  { id: "exp_scroll", name: "EXP Scroll", desc: "+50% EXP for 1 hour", cost: 100, icon: TrendingUp, color: "text-green-400", minGuildLevel: 1 },
  { id: "gold_scroll", name: "Gold Scroll", desc: "+50% Gold for 1 hour", cost: 100, icon: Gem, color: "text-yellow-400", minGuildLevel: 1 },
  { id: "damage_rune", name: "Damage Rune", desc: "+30% DMG for 30 min", cost: 150, icon: Zap, color: "text-red-400", minGuildLevel: 2 },
  { id: "defense_rune", name: "Defense Rune", desc: "+30% DEF for 30 min", cost: 150, icon: Shield, color: "text-blue-400", minGuildLevel: 2 },
  { id: "rare_chest", name: "Rare Chest", desc: "Contains a rare+ item", cost: 500, icon: ShoppingBag, color: "text-purple-400", minGuildLevel: 3 },
  { id: "epic_chest", name: "Epic Chest", desc: "Contains an epic+ item", cost: 1500, icon: ShoppingBag, color: "text-yellow-400", minGuildLevel: 5 },
];

export default function GuildShop({ guild, onBuy, isBuying }) {
  const tokens = guild.guild_tokens || 0;
  const guildLevel = guild.level || 1;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Your tokens: <span className="text-purple-400 font-semibold">{tokens}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SHOP_ITEMS.map(item => {
          const Icon = item.icon;
          const locked = guildLevel < item.minGuildLevel;
          const canAfford = tokens >= item.cost;
          return (
            <div
              key={item.id}
              className={`bg-muted/40 rounded-lg p-4 border ${locked ? "border-border opacity-60" : "border-border"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="font-medium text-sm">{item.name}</span>
                {locked && <Badge variant="outline" className="text-xs ml-auto">Guild Lv.{item.minGuildLevel}+</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
              <Button
                size="sm"
                className="w-full text-xs"
                disabled={locked || !canAfford || isBuying}
                onClick={() => onBuy(item)}
              >
                {item.cost} Tokens
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}