import { type Request, type Response } from "express";
import { db, charactersTable, userRolesTable } from "../db/index.js";
import { eq } from "drizzle-orm";

export function requireAuth(req: Request, res: Response): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

export async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  if (!requireAuth(req, res)) return false;
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, req.user!.id));
  if (!roleRow || (roleRow.role !== "admin" && roleRow.role !== "moderator")) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
}

export async function verifyCharacterOwner(req: Request, characterId: string): Promise<boolean> {
  if (!characterId) return false;
  const [char] = await db.select({ createdBy: charactersTable.createdBy }).from(charactersTable).where(eq(charactersTable.id, characterId));
  return char?.createdBy === req.user!.id;
}

export async function requireCharacterOwner(req: Request, res: Response, characterId: string): Promise<boolean> {
  if (!requireAuth(req, res)) return false;
  if (!characterId) { res.status(400).json({ error: "characterId is required" }); return false; }
  const isOwner = await verifyCharacterOwner(req, characterId);
  if (!isOwner) { res.status(403).json({ error: "Not your character" }); return false; }
  return true;
}
