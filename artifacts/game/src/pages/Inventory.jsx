import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Backpack, Swords, ShieldCheck, Crown, Footprints, CircleDot,
  Gem, Coins, ArrowUpRight, FlaskConical, Package, Hand
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getItemIcon } from "@/lib/itemIcons";
import { RARITY_CONFIG } from "@/lib/gameData";
import { canEquipItem, validateEquip, getAllowedClassesLabel, EQUIPMENT_SLOTS, SLOT_LABELS } from "@/lib/equipmentSystem";
import { calculateFinalStats } from "@/lib/statSystem";
import { aggregateSetStats } from "@/lib/setSystem";
import ItemTooltip from "@/components/game/ItemTooltip";

const TYPE_ICONS = {
  weapon: Swords,
  armor: ShieldCheck,
  helmet: Crown,
  gloves: Hand,
  boots: Footprints,
  ring: CircleDot,
  amulet: Gem,
  consumable: FlaskConical,
  material: Package,
};

const SLOT_ORDER = ["weapon", "armor", "helmet", "gloves", "boots", "ring", "amulet"];

export default function Inventory({ character, onCharacterUpdate }) {
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", character?.id],
    queryFn: () => base44.entities.Item.filter({ owner_id: character?.id }),
    enabled: !!character?.id,
  });

  const applyEquipmentStats = async (newEquip, updatedItems) => {
    const nowEquipped = updatedItems.filter(i => Object.values(newEquip).includes(i.id));
    const setStats = aggregateSetStats(nowEquipped);
    const { derived } = calculateFinalStats(character, nowEquipped, setStats);
    const updates = { equipment: newEquip, max_hp: derived.maxHp, max_mp: derived.maxMp };
    await base44.entities.Character.update(character.id, updates);
    onCharacterUpdate({ ...character, ...updates });
  };

  const equipMutation = useMutation({
    mutationFn: async (item) => {
      const slot = item.type;
      if (!SLOT_ORDER.includes(slot)) return;
      // Centralized validation — single pipeline
      const { valid, reason } = validateEquip(character, item);
      if (!valid) {
        alert(reason);
        return;
      }

      const currentEquipId = character.equipment?.[slot];
      const updates = [];
      if (currentEquipId) updates.push(base44.entities.Item.update(currentEquipId, { equipped: false }));
      updates.push(base44.entities.Item.update(item.id, { equipped: true }));
      await Promise.all(updates);

      const newEquip = { ...(character.equipment || {}), [slot]: item.id };
      // Build updated item list for stat calculation
      const updatedItems = items
        .map(i => i.id === item.id ? { ...i, equipped: true } : i.id === currentEquipId ? { ...i, equipped: false } : i);
      await applyEquipmentStats(newEquip, updatedItems);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async (item) => {
      const slot = item.type;
      await base44.entities.Item.update(item.id, { equipped: false });
      const newEquip = { ...(character.equipment || {}) };
      delete newEquip[slot];
      const updatedItems = items.map(i => i.id === item.id ? { ...i, equipped: false } : i);
      await applyEquipmentStats(newEquip, updatedItems);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async (itemIdToSell) => {
      const response = await base44.functions.invoke('sellItem', { itemId: itemIdToSell });
      if (response.data?.success) {
        onCharacterUpdate({ ...character, gold: response.data.newGold });
        queryClient.invalidateQueries({ queryKey: ["items"] });
        queryClient.invalidateQueries({ queryKey: ["characters"] });
        setSelectedItem(null);
        toast({ title: `Sold for ${response.data.sellPrice} gold!`, duration: 1000 });
      } else if (response.data?.error) {
        toast({ title: response.data.error, variant: 'destructive' });
      }
      return response.data;
    },
  });

  const sellAllMutation = useMutation({
    mutationFn: async () => {
      const unequipped = items.filter(i => !i.equipped);
      if (unequipped.length === 0) return;
      
      await Promise.all(unequipped.map(item => base44.functions.invoke('sellItem', { itemId: item.id })));
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
    onError: (error) => {
      console.error('Sell all failed:', error);
    },
  });

  const equipped = items.filter(i => i.equipped);

  // Stack consumables by name, keep non-consumables as-is
  const consumableStacks = items
    .filter(i => i.type === "consumable")
    .reduce((acc, item) => {
      const key = item.name;
      if (!acc[key]) acc[key] = { ...item, stackCount: 0, stackIds: [] };
      acc[key].stackCount++;
      acc[key].stackIds.push(item.id);
      return acc;
    }, {});
  const stackedConsumables = Object.values(consumableStacks);

  const rawFiltered = filter === "all" ? items : items.filter(i => i.type === filter);
  // Replace consumables with stacked versions
  const filtered = (filter === "consumable"
    ? stackedConsumables
    : filter === "all"
      ? [...items.filter(i => i.type !== "consumable"), ...stackedConsumables]
      : rawFiltered
  ).sort((a, b) => (RARITY_CONFIG[b.rarity]?.order ?? -1) - (RARITY_CONFIG[a.rarity]?.order ?? -1));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron text-xl font-bold flex items-center gap-2">
          <Backpack className="w-5 h-5 text-primary" /> Inventory
        </h2>
        {items.filter(i => !i.equipped).length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => sellAllMutation.mutate()}
            disabled={sellAllMutation.isPending}
            className="gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            Sell All ({items.filter(i => !i.equipped).length} items · {items.filter(i => !i.equipped).reduce((s, i) => s + (i.sell_price || 5), 0)}g)
          </Button>
        )}
      </div>

      {/* Equipment Slots */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">EQUIPMENT</h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {SLOT_ORDER.map(slot => {
            const item = equipped.find(i => i.type === slot && i.equipped);
            const Icon = item ? getItemIcon(item) : (TYPE_ICONS[slot] || Backpack);
            const rarity = item ? RARITY_CONFIG[item.rarity] : null;
            return (
              <button
                key={slot}
                onClick={() => item && setSelectedItem(item)}
                className={`p-3 rounded-lg border-2 text-center transition-all relative ${
                  item
                    ? `${rarity?.border} ${rarity?.bg}`
                    : "border-dashed border-border bg-muted/30"
                }`}
              >
                <div className="relative inline-block mb-1">
                  <Icon className={`w-5 h-5 ${item ? rarity?.color : "text-muted-foreground"}`} />
                  {item?.item_level && (
                    <span className={`absolute -bottom-1 -right-2 text-[8px] font-bold leading-none px-0.5 rounded ${rarity?.color} bg-background border border-current`}>
                      {item.item_level}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate">{item ? item.name : SLOT_LABELS[slot]}</p>
                {item && (
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {(item.upgrade_level || 0) > 0 && (
                      <span className="text-[8px] font-bold text-green-400">+{item.upgrade_level}</span>
                    )}
                    {(item.star_level || 0) > 0 && (
                      <span className="text-[8px] text-yellow-400">★{item.star_level}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-muted flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs"><Backpack className="w-3 h-3" />All</TabsTrigger>
          <TabsTrigger value="weapon" className="flex items-center gap-1 text-xs"><Swords className="w-3 h-3" />Weapons</TabsTrigger>
          <TabsTrigger value="armor" className="flex items-center gap-1 text-xs"><ShieldCheck className="w-3 h-3" />Armor</TabsTrigger>
          <TabsTrigger value="helmet" className="flex items-center gap-1 text-xs"><Crown className="w-3 h-3" />Helmets</TabsTrigger>
          <TabsTrigger value="gloves" className="flex items-center gap-1 text-xs"><Hand className="w-3 h-3" />Gloves</TabsTrigger>
          <TabsTrigger value="boots" className="flex items-center gap-1 text-xs"><Footprints className="w-3 h-3" />Boots</TabsTrigger>
          <TabsTrigger value="ring" className="flex items-center gap-1 text-xs"><CircleDot className="w-3 h-3" />Rings</TabsTrigger>
          <TabsTrigger value="amulet" className="flex items-center gap-1 text-xs"><Gem className="w-3 h-3" />Amulets</TabsTrigger>
          <TabsTrigger value="consumable" className="flex items-center gap-1 text-xs"><FlaskConical className="w-3 h-3" />Consumables</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {isLoading && Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 animate-pulse h-24" />
        ))}
        {filtered.map(item => {
          const rarity = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
          const Icon = getItemIcon(item);
          const { valid: canEquip } = validateEquip(character, item);
          const levelOk = character.level >= (item.level_req || 1);
          const classOk = canEquipItem(character.class, item).allowed;
          const isStack = item.stackCount > 1;
          const itemLevel = item.item_level;
          const isSetItem = item.rarity === "set";
          return (
            <motion.button
              key={item.stackIds ? item.name : item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedItem(item)}
              className={`relative bg-card border rounded-lg p-3 text-left transition-all hover:bg-muted/50 ${
                item.equipped ? `${rarity.border} ${rarity.bg}` : !canEquip ? "border-destructive/30 opacity-60" : "border-border"
              } ${item.rarity === "shiny" ? "ring-1 ring-yellow-400/50" : ""} ${isSetItem ? "ring-1 ring-cyan-400/50" : ""}`}
            >
              {isStack && (
                <span className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  x{item.stackCount}
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                {/* Icon with level overlay */}
                <div className="relative flex-shrink-0">
                  <Icon className={`w-5 h-5 ${rarity.color}`} />
                  {itemLevel && (
                    <span className={`absolute -bottom-1 -right-1 text-[9px] font-bold leading-none px-0.5 rounded ${rarity.color} bg-background border border-current`}>
                      {itemLevel}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-semibold ${rarity.color} truncate block`}>{item.name}</span>
                  {/* Upgrade level + stars row */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {(item.upgrade_level || 0) > 0 && (
                      <span className="text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 rounded px-1 leading-tight">
                        +{item.upgrade_level}
                      </span>
                    )}
                    <span className="text-[9px] text-yellow-400 tracking-tight leading-none">
                      {Array.from({length: 7}).map((_, si) => (
                        <span key={si} className={si < (item.star_level || 0) ? "text-yellow-400" : "text-muted-foreground/30"}>★</span>
                      ))}
                    </span>
                    {(item.star_level || 0) > 0 && (
                      <span className="text-[9px] text-yellow-400">{item.star_level}/7</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline" className={`text-xs ${rarity.color} ${rarity.border}`}>
                  {rarity.label}
                </Badge>
                {item.equipped && <Badge className="text-xs bg-primary/20 text-primary">Equipped</Badge>}
                {isSetItem && item.rarity === "set" && <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">⚔️ Set Item</Badge>}
                {!levelOk && <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">Req. {item.level_req}</Badge>}
                {levelOk && !classOk && <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">Wrong Class</Badge>}
              </div>
            </motion.button>
          );
        })}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No items found.
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`bg-card border-2 rounded-xl p-5 w-full max-w-sm ${RARITY_CONFIG[selectedItem.rarity]?.border}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Get the currently equipped item in this slot for comparison */}
              {(() => {
                const equippedInSlot = equipped.find(i => i.type === selectedItem.type && i.id !== selectedItem.id);
                const { valid: canEquip, reason: equipReason } = validateEquip(character, selectedItem);
                const levelOk = character.level >= (selectedItem.level_req || 1);
                const classCheck = canEquipItem(character.class, selectedItem);
                return (
                  <>
                    <ItemTooltip
                      item={selectedItem}
                      characterLevel={character.level}
                      characterClass={character.class}
                      compareItem={!selectedItem.equipped ? equippedInSlot : null}
                      equippedItems={equipped}
                      character={character}
                    />
                    {equippedInSlot && !selectedItem.equipped && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Currently Equipped:</p>
                        <p className={`text-sm font-medium ${RARITY_CONFIG[equippedInSlot.rarity]?.color}`}>{equippedInSlot.name}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-5">
                      {SLOT_ORDER.includes(selectedItem.type) && (
                        selectedItem.equipped ? (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => unequipMutation.mutate(selectedItem)}>
                            Unequip
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 gap-1"
                            disabled={!canEquip}
                            onClick={() => equipMutation.mutate(selectedItem)}
                            title={!canEquip ? equipReason : ""}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            {!levelOk ? `Req. Lv.${selectedItem.level_req}` : !classCheck.allowed ? "Wrong Class" : "Equip"}
                          </Button>
                        )
                      )}

                      <Button variant="destructive" size="sm" onClick={() => sellMutation.mutate(selectedItem.stackIds ? selectedItem.stackIds[0] : selectedItem.id)}>
                        <Coins className="w-3.5 h-3.5 mr-1" /> Sell {selectedItem.stackIds ? "1" : ""} ({selectedItem.sell_price || 5}g)
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSelectedItem(null)}>
                      Close
                    </Button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}