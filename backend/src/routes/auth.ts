import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "../db/index.js";
import {
  clearSession,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth.js";

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json({
    user: req.isAuthenticated() ? req.user : null,
  });
});

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { id, email, firstName, lastName, profileImageUrl } = req.body;
    if (!id) { res.status(400).json({ error: "id is required" }); return; }

    const [user] = await db
      .insert(usersTable)
      .values({ id, email: email || null, firstName: firstName || null, lastName: lastName || null, profileImageUrl: profileImageUrl || null })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { email: email || null, firstName: firstName || null, lastName: lastName || null, profileImageUrl: profileImageUrl || null, updatedAt: new Date() },
      })
      .returning();

    const sessionData: SessionData = {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl },
      access_token: "",
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.json({ user: sessionData.user, sessionId: sid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

if (!email || !password) {
  res.status(400).json({ error: "email and password required" });
  return;
}

// 🔥 TEMP USER (bis echte DB dran ist)
const user = {
  id: email, // simple ID
  email: email,
  firstName: "Player",
  lastName: "",
  profileImageUrl: null,
};

const sessionData: SessionData = {
  user,
  access_token: "",
};

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.json({ user: sessionData.user, sessionId: sid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json({ success: true });
});

export default router;
