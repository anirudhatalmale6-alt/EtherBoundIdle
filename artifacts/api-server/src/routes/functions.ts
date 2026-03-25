import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  charactersTable,
  itemsTable,
  guildsTable,
  questsTable,
  tradesTable,
  partiesTable,
  partyActivitiesTable,
  partyInvitesTable,
  userRolesTable,
  usersTable,
  gameConfigTable,
  resourcesTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  if (!requireAuth(req, res)) return false;
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, req.user!.id));
  if (!roleRow || (roleRow.role !== "admin" && roleRow.role !== "moderator")) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

async function verifyCharacterOwner(req: Request, characterId: string): Promise<boolean> {
  if (!characterId) return false;
  const [char] = await db.select({ createdBy: charactersTable.createdBy }).from(charactersTable).where(eq(charactersTable.id, characterId));
  return char?.createdBy === req.user!.id;
}

router.post("/functions/getCurrentUser", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, req.user!.id));
    res.json({
      data: {
        id: req.user!.id,
        email: req.user!.email,
        role: roleRow?.role || "player",
      },
    });
  } catch (err: any) {
    res.json({ data: { id: req.user!.id, email: req.user!.email, role: "player" } });
  }
});

router.post("/functions/getAllUsers", async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  try {
    const users = await db.select().from(usersTable);
    const roles = await db.select().from(userRolesTable);
    const roleMap = Object.fromEntries(roles.map(r => [r.userId, r.role]));

    res.json({
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        role: roleMap[u.id] || "player",
      })),
    });
  } catch (err: any) {
    req.log.error({ err }, "getAllUsers error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/getAllCharacters", async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  try {
    const chars = await db.select().from(charactersTable).orderBy(desc(charactersTable.level));
    res.json({
      data: chars.map(c => toClientCharacter(c)),
    });
  } catch (err: any) {
    req.log.error({ err }, "getAllCharacters error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/updateUserRole", async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  try {
    const { userId, role } = req.body;
    await db.insert(userRolesTable).values({ userId, role }).onConflictDoUpdate({
      target: userRolesTable.userId,
      set: { role, updatedAt: new Date() },
    });
    res.json({ data: { success: true } });
  } catch (err: any) {
    req.log.error({ err }, "updateUserRole error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/managePlayer", async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  try {
    const { characterId, action, ...rest } = req.body;
    if (characterId) {
      const updateData: Record<string, any> = {};
      if (action === "ban") updateData.isBanned = true;
      else if (action === "unban") updateData.isBanned = false;
      else if (action === "mute") updateData.isMuted = true;
      else if (action === "unmute") updateData.isMuted = false;
      else {
        Object.assign(updateData, rest);
      }

      if (Object.keys(updateData).length > 0) {
        const [updated] = await db.update(charactersTable).set(updateData).where(eq(charactersTable.id, characterId)).returning();
        res.json({ data: updated ? toClientCharacter(updated) : null });
        return;
      }
    }
    res.json({ data: { success: true } });
  } catch (err: any) {
    req.log.error({ err }, "managePlayer error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/registerUser", async (req: Request, res: Response) => {
  res.json({ data: { success: true, message: "Use Replit Auth to register" } });
});

router.post("/functions/claimDailyLogin", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId } = req.body;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) {
      res.status(404).json({ error: "Character not found" });
      return;
    }

    const now = new Date();
    const lastLogin = char.lastDailyLogin ? new Date(char.lastDailyLogin) : null;
    const isConsecutive = lastLogin && (now.getTime() - lastLogin.getTime()) < 48 * 60 * 60 * 1000;
    const streak = isConsecutive ? (char.dailyLoginStreak || 0) + 1 : 1;

    const goldReward = 100 + (streak * 50);
    const gemReward = streak >= 7 ? 5 : (streak >= 3 ? 2 : 0);

    const [updated] = await db.update(charactersTable).set({
      dailyLoginStreak: streak,
      lastDailyLogin: now,
      gold: (char.gold || 0) + goldReward,
      gems: (char.gems || 0) + gemReward,
    }).where(eq(charactersTable.id, characterId)).returning();

    res.json({
      data: {
        streak,
        rewards: { gold: goldReward, gems: gemReward },
        character: updated ? toClientCharacter(updated) : null,
      },
    });
  } catch (err: any) {
    req.log.error({ err }, "claimDailyLogin error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/sellItem", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { itemId } = req.body;
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId));
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const rarityMultiplier: Record<string, number> = {
      common: 1, uncommon: 2, rare: 5, epic: 10, legendary: 25, mythic: 50, shiny: 100,
    };
    const goldValue = (item.level || 1) * 10 * (rarityMultiplier[item.rarity] || 1);

    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, item.ownerId));
    if (char) {
      await db.update(charactersTable).set({ gold: (char.gold || 0) + goldValue }).where(eq(charactersTable.id, char.id));
    }

    await db.delete(itemsTable).where(eq(itemsTable.id, itemId));

    res.json({ data: { success: true, gold_earned: goldValue } });
  } catch (err: any) {
    req.log.error({ err }, "sellItem error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/upgradeItemSafe", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { itemId } = req.body;
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId));
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }

    const cost = (item.upgradeLevel + 1) * 100;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, item.ownerId));
    if (!char || (char.gold || 0) < cost) {
      res.json({ data: { success: false, message: "Not enough gold" } });
      return;
    }

    const newLevel = (item.upgradeLevel || 0) + 1;
    const [updated] = await db.update(itemsTable).set({ upgradeLevel: newLevel }).where(eq(itemsTable.id, itemId)).returning();
    await db.update(charactersTable).set({ gold: char.gold - cost }).where(eq(charactersTable.id, char.id));

    res.json({ data: { success: true, item: updated, gold_spent: cost } });
  } catch (err: any) {
    req.log.error({ err }, "upgradeItemSafe error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/starUpgradeItem", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { itemId } = req.body;
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId));
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }

    const cost = ((item.starLevel || 0) + 1) * 200;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, item.ownerId));
    if (!char || (char.gold || 0) < cost) {
      res.json({ data: { success: false, message: "Not enough gold" } });
      return;
    }

    const successChance = Math.max(0.3, 1 - (item.starLevel || 0) * 0.1);
    const success = Math.random() < successChance;

    if (success) {
      const [updated] = await db.update(itemsTable).set({ starLevel: (item.starLevel || 0) + 1 }).where(eq(itemsTable.id, itemId)).returning();
      await db.update(charactersTable).set({ gold: char.gold - cost }).where(eq(charactersTable.id, char.id));
      res.json({ data: { success: true, item: updated, gold_spent: cost } });
    } else {
      await db.update(charactersTable).set({ gold: char.gold - cost }).where(eq(charactersTable.id, char.id));
      res.json({ data: { success: false, message: "Star upgrade failed!", gold_spent: cost } });
    }
  } catch (err: any) {
    req.log.error({ err }, "starUpgradeItem error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/awakenItem", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { itemId } = req.body;
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId));
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }

    const cost = 1000;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, item.ownerId));
    if (!char || (char.gems || 0) < cost) {
      res.json({ data: { success: false, message: "Not enough gems" } });
      return;
    }

    const [updated] = await db.update(itemsTable).set({ awakened: true }).where(eq(itemsTable.id, itemId)).returning();
    await db.update(charactersTable).set({ gems: (char.gems || 0) - cost }).where(eq(charactersTable.id, char.id));

    res.json({ data: { success: true, item: updated, gems_spent: cost } });
  } catch (err: any) {
    req.log.error({ err }, "awakenItem error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/getShopRotation", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const now = new Date();
  const seed = Math.floor(now.getTime() / (6 * 60 * 60 * 1000));

  const shopItems = [
    { id: `shop_${seed}_1`, name: "Health Potion", type: "consumable", price: 50, currency: "gold" },
    { id: `shop_${seed}_2`, name: "Mana Potion", type: "consumable", price: 50, currency: "gold" },
    { id: `shop_${seed}_3`, name: "Mystery Box", type: "lootbox", price: 100, currency: "gems" },
    { id: `shop_${seed}_4`, name: "EXP Boost", type: "boost", price: 200, currency: "gold" },
    { id: `shop_${seed}_5`, name: "Gold Boost", type: "boost", price: 150, currency: "gold" },
  ];

  res.json({ data: { items: shopItems, refreshes_at: new Date((seed + 1) * 6 * 60 * 60 * 1000).toISOString() } });
});

router.post("/functions/manageDailyQuests", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId } = req.body;
    const existing = await db.select().from(questsTable).where(eq(questsTable.characterId, characterId));

    const activeQuests = existing.filter(q => q.status === "active");
    if (activeQuests.length >= 3) {
      res.json({ data: { quests: existing } });
      return;
    }

    const questTemplates = [
      { title: "Monster Slayer", description: "Kill 10 enemies", type: "daily", target: 10, reward: { gold: 200, exp: 100 } },
      { title: "Gold Hoarder", description: "Earn 500 gold", type: "daily", target: 500, reward: { gold: 300, gems: 1 } },
      { title: "Level Up", description: "Gain a level", type: "daily", target: 1, reward: { gold: 500, gems: 2 } },
    ];

    const newQuests = [];
    for (const template of questTemplates.slice(0, 3 - activeQuests.length)) {
      const [quest] = await db.insert(questsTable).values({
        characterId,
        type: template.type,
        title: template.title,
        description: template.description,
        target: template.target,
        reward: template.reward,
        status: "active",
      }).returning();
      newQuests.push(quest);
    }

    res.json({ data: { quests: [...existing, ...newQuests] } });
  } catch (err: any) {
    req.log.error({ err }, "manageDailyQuests error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/updateQuestProgress", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId, questType, amount } = req.body;
    const quests = await db.select().from(questsTable).where(eq(questsTable.characterId, characterId));
    const active = quests.filter(q => q.status === "active");

    for (const quest of active) {
      const newProgress = Math.min((quest.progress || 0) + (amount || 1), quest.target);
      const newStatus = newProgress >= quest.target ? "completed" : "active";
      await db.update(questsTable).set({ progress: newProgress, status: newStatus }).where(eq(questsTable.id, quest.id));
    }

    res.json({ data: { success: true } });
  } catch (err: any) {
    req.log.error({ err }, "updateQuestProgress error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/lifeSkills", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId, action, skillType, upgradeType } = req.body;

    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    const lifeSkills = (char.lifeSkills as any) || {};

    if (action === "getState") {
      res.json({ data: { life_skills: lifeSkills } });
      return;
    }

    if (action === "gather" || action === "craft" || action === "process") {
      const skill = lifeSkills[skillType] || { level: 1, exp: 0 };
      skill.exp = (skill.exp || 0) + 10;
      if (skill.exp >= skill.level * 100) {
        skill.level += 1;
        skill.exp = 0;
      }
      lifeSkills[skillType] = skill;
      await db.update(charactersTable).set({ lifeSkills }).where(eq(charactersTable.id, characterId));
      res.json({ data: { life_skills: lifeSkills, success: true } });
      return;
    }

    if (action === "upgrade") {
      const skill = lifeSkills[skillType] || { level: 1, exp: 0 };
      skill.level += 1;
      lifeSkills[skillType] = skill;
      await db.update(charactersTable).set({ lifeSkills }).where(eq(charactersTable.id, characterId));
      res.json({ data: { life_skills: lifeSkills, success: true } });
      return;
    }

    res.json({ data: { life_skills: lifeSkills } });
  } catch (err: any) {
    req.log.error({ err }, "lifeSkills error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/processGemLab", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId } = req.body;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    const gemLab = (char.gemLab as any) || { level: 1, gems_stored: 0 };
    const gemsGenerated = gemLab.level || 1;
    gemLab.gems_stored = (gemLab.gems_stored || 0) + gemsGenerated;

    await db.update(charactersTable).set({ gemLab }).where(eq(charactersTable.id, characterId));
    res.json({ data: { gem_lab: gemLab, gems_generated: gemsGenerated } });
  } catch (err: any) {
    req.log.error({ err }, "processGemLab error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/claimGemLabGems", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId } = req.body;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    const gemLab = (char.gemLab as any) || { level: 1, gems_stored: 0 };
    const gemsToAdd = gemLab.gems_stored || 0;
    gemLab.gems_stored = 0;

    await db.update(charactersTable).set({
      gemLab,
      gems: (char.gems || 0) + gemsToAdd,
    }).where(eq(charactersTable.id, characterId));

    res.json({ data: { gems_claimed: gemsToAdd, gem_lab: gemLab } });
  } catch (err: any) {
    req.log.error({ err }, "claimGemLabGems error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/upgradeGemLab", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId, upgradeType } = req.body;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    const gemLab = (char.gemLab as any) || { level: 1, gems_stored: 0 };
    const cost = gemLab.level * 500;

    if ((char.gold || 0) < cost) {
      res.json({ data: { success: false, message: "Not enough gold" } });
      return;
    }

    gemLab.level = (gemLab.level || 1) + 1;
    await db.update(charactersTable).set({
      gemLab,
      gold: char.gold - cost,
    }).where(eq(charactersTable.id, characterId));

    res.json({ data: { success: true, gem_lab: gemLab, gold_spent: cost } });
  } catch (err: any) {
    req.log.error({ err }, "upgradeGemLab error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/transmuteGold", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId, amount } = req.body;
    if (!characterId) {
      res.json({ data: { rate: 1000, description: "1000 gold = 1 gem" } });
      return;
    }

    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    const goldCost = (amount || 1) * 1000;
    if ((char.gold || 0) < goldCost) {
      res.json({ data: { success: false, message: "Not enough gold" } });
      return;
    }

    await db.update(charactersTable).set({
      gold: char.gold - goldCost,
      gems: (char.gems || 0) + (amount || 1),
    }).where(eq(charactersTable.id, characterId));

    res.json({ data: { success: true, gold_spent: goldCost, gems_gained: amount || 1 } });
  } catch (err: any) {
    req.log.error({ err }, "transmuteGold error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/completeTrade", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { trade_id, action } = req.body;
    const [trade] = await db.select().from(tradesTable).where(eq(tradesTable.id, trade_id));
    if (!trade) { res.status(404).json({ error: "Trade not found" }); return; }

    if (action === "accept") {
      await db.update(tradesTable).set({ status: "completed" }).where(eq(tradesTable.id, trade_id));
      if (trade.offeredGold && trade.toCharacterId) {
        const [receiver] = await db.select().from(charactersTable).where(eq(charactersTable.id, trade.toCharacterId));
        if (receiver) {
          await db.update(charactersTable).set({ gold: (receiver.gold || 0) + trade.offeredGold }).where(eq(charactersTable.id, trade.toCharacterId));
        }
      }
      res.json({ data: { success: true, trade_id, status: "completed" } });
    } else if (action === "decline" || action === "cancel") {
      await db.update(tradesTable).set({ status: "cancelled" }).where(eq(tradesTable.id, trade_id));
      res.json({ data: { success: true, trade_id, status: "cancelled" } });
    } else {
      res.json({ data: { success: true, trade_id } });
    }
  } catch (err: any) {
    req.log.error({ err }, "completeTrade error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/manageParty", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId, action, partyId, targetCharacterId, ...rest } = req.body;

    if (action === "create") {
      const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
      if (!char) { res.status(404).json({ error: "Character not found" }); return; }
      const [party] = await db.insert(partiesTable).values({
        leaderId: characterId,
        leaderName: char.name,
        members: [{ id: characterId, name: char.name }],
        status: "active",
        maxMembers: 4,
      }).returning();
      res.json({ data: { success: true, party } });
      return;
    }

    if (action === "invite" && partyId && targetCharacterId) {
      const [invite] = await db.insert(partyInvitesTable).values({
        partyId,
        fromCharacterId: characterId,
        fromCharacterName: rest.characterName || "Unknown",
        toCharacterId: targetCharacterId,
        status: "pending",
      }).returning();
      res.json({ data: { success: true, invite } });
      return;
    }

    if (action === "join" && partyId) {
      const [party] = await db.select().from(partiesTable).where(eq(partiesTable.id, partyId));
      if (!party) { res.status(404).json({ error: "Party not found" }); return; }
      const members = (party.members as any[]) || [];
      if (members.length >= (party.maxMembers || 4)) {
        res.json({ data: { success: false, message: "Party is full" } });
        return;
      }
      const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
      members.push({ id: characterId, name: char?.name || "Unknown" });
      await db.update(partiesTable).set({ members }).where(eq(partiesTable.id, partyId));
      res.json({ data: { success: true, party: { ...party, members } } });
      return;
    }

    if (action === "leave" && partyId) {
      const [party] = await db.select().from(partiesTable).where(eq(partiesTable.id, partyId));
      if (party) {
        const members = ((party.members as any[]) || []).filter((m: any) => m.id !== characterId);
        if (members.length === 0) {
          await db.update(partiesTable).set({ status: "disbanded", members: [] }).where(eq(partiesTable.id, partyId));
        } else {
          await db.update(partiesTable).set({ members }).where(eq(partiesTable.id, partyId));
        }
      }
      res.json({ data: { success: true } });
      return;
    }

    if (action === "disband" && partyId) {
      await db.update(partiesTable).set({ status: "disbanded", members: [] }).where(eq(partiesTable.id, partyId));
      res.json({ data: { success: true } });
      return;
    }

    res.json({ data: { success: true, action } });
  } catch (err: any) {
    req.log.error({ err }, "manageParty error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/dungeonAction", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId, action, dungeonId, ...rest } = req.body;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    res.json({ data: { success: true, action, character: toClientCharacter(char) } });
  } catch (err: any) {
    req.log.error({ err }, "dungeonAction error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/processServerProgression", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    res.json({ data: { success: true } });
  } catch (err: any) {
    req.log.error({ err }, "processServerProgression error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/catchUpOfflineProgress", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { characterId } = req.body;
    const [char] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
    if (!char) { res.status(404).json({ error: "Character not found" }); return; }

    const lastClaim = char.lastIdleClaim ? new Date(char.lastIdleClaim).getTime() : Date.now();
    const offlineMs = Date.now() - lastClaim;
    const offlineHours = Math.min(offlineMs / (1000 * 60 * 60), 8);

    if (offlineHours < 0.1) {
      res.json({ data: { rewards: null, hours: 0 } });
      return;
    }

    const goldReward = Math.floor(offlineHours * char.level * 50);
    const expReward = Math.floor(offlineHours * char.level * 20);

    await db.update(charactersTable).set({
      gold: (char.gold || 0) + goldReward,
      exp: (char.exp || 0) + expReward,
      lastIdleClaim: new Date(),
    }).where(eq(charactersTable.id, characterId));

    res.json({
      data: {
        rewards: { gold: goldReward, exp: expReward },
        hours: Math.round(offlineHours * 10) / 10,
      },
    });
  } catch (err: any) {
    req.log.error({ err }, "catchUpOfflineProgress error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/unifiedPlayerProgression", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    res.json({ data: { success: true } });
  } catch (err: any) {
    req.log.error({ err }, "unifiedPlayerProgression error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/gameConfigManager", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { action, config: newConfig } = req.body;

    if (action === "update" && newConfig) {
      if (!(await requireAdmin(req, res))) return;
      await db.insert(gameConfigTable).values({ id: "global", config: newConfig }).onConflictDoUpdate({
        target: gameConfigTable.id,
        set: { config: newConfig, updatedAt: new Date() },
      });
      res.json({ data: { success: true, config: newConfig } });
      return;
    }

    const [configRow] = await db.select().from(gameConfigTable).where(eq(gameConfigTable.id, "global"));
    res.json({ data: { config: configRow?.config || {} } });
  } catch (err: any) {
    req.log.error({ err }, "gameConfigManager error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/functions/:name", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  req.log.warn({ functionName: req.params.name }, "Unhandled function call");
  res.json({ data: { success: true, message: `Function ${req.params.name} stub` } });
});

function toClientCharacter(c: any) {
  return {
    id: c.id,
    created_by: c.createdBy,
    name: c.name,
    class: c.class,
    level: c.level,
    exp: c.exp,
    exp_to_next: c.expToNext,
    hp: c.hp,
    max_hp: c.maxHp,
    mp: c.mp,
    max_mp: c.maxMp,
    strength: c.strength,
    dexterity: c.dexterity,
    intelligence: c.intelligence,
    vitality: c.vitality,
    luck: c.luck,
    stat_points: c.statPoints,
    skill_points: c.skillPoints,
    gold: c.gold,
    gems: c.gems,
    current_region: c.currentRegion,
    equipment: c.equipment,
    skills: c.skills,
    hotbar_skills: c.hotbarSkills,
    idle_mode: c.idleMode,
    total_kills: c.totalKills,
    total_damage: c.totalDamage,
    prestige_level: c.prestigeLevel,
    achievements: c.achievements,
    daily_quests_completed: c.dailyQuestsCompleted,
    weekly_quests_completed: c.weeklyQuestsCompleted,
    last_idle_claim: c.lastIdleClaim,
    guild_id: c.guildId,
    is_banned: c.isBanned,
    is_muted: c.isMuted,
    title: c.title,
    life_skills: c.lifeSkills,
    gem_lab: c.gemLab,
    daily_login_streak: c.dailyLoginStreak,
    last_daily_login: c.lastDailyLogin,
    dungeon_data: c.dungeonData,
    skill_tree_data: c.skillTreeData,
    extra_data: c.extraData,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

export default router;
