import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
  type AuthUser,
} from "../lib/auth";
import { sendSuccess, sendError } from "../lib/response";

const SALT_ROUNDS = 12;
const router: IRouter = Router();

const isProduction = process.env.NODE_ENV === "production";

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function sanitizeUser(row: typeof usersTable.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username ?? null,
    firstName: row.firstName ?? null,
    lastName: row.lastName ?? null,
    profileImageUrl: row.profileImageUrl ?? null,
  };
}

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body ?? {};

    if (!isValidEmail(email)) {
      sendError(res, 400, "A valid email address is required.");
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      sendError(res, 400, "Password must be at least 6 characters.");
      return;
    }

    if (username !== undefined && username !== null && typeof username !== "string") {
      sendError(res, 400, "Username must be a string.");
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let newUser;
    try {
      [newUser] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          passwordHash,
          username: typeof username === "string" ? username.trim() || null : null,
        })
        .returning();
    } catch (dbErr: any) {
      const pgCode = dbErr?.code || dbErr?.cause?.code;
      const pgConstraint = dbErr?.constraint || dbErr?.cause?.constraint || "";
      if (pgCode === "23505" || pgConstraint.includes("email")) {
        sendError(res, 409, "An account with this email already exists.");
        return;
      }
      throw dbErr;
    }

    const authUser = sanitizeUser(newUser);
    const sessionData: SessionData = { user: authUser };
    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);

    sendSuccess(res, { user: authUser }, 201);
  } catch (err: any) {
    req.log.error({ err }, "Register error");
    sendError(res, 500, "Registration failed. Please try again.");
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!isValidEmail(email)) {
      sendError(res, 400, "A valid email address is required.");
      return;
    }

    if (typeof password !== "string" || !password) {
      sendError(res, 400, "Password is required.");
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));

    if (!user) {
      sendError(res, 401, "Invalid email or password.");
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      sendError(res, 401, "Invalid email or password.");
      return;
    }

    const authUser = sanitizeUser(user);
    const sessionData: SessionData = { user: authUser };
    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);

    sendSuccess(res, { user: authUser });
  } catch (err: any) {
    req.log.error({ err }, "Login error");
    sendError(res, 500, "Login failed. Please try again.");
  }
});

router.get("/auth/user", (req: Request, res: Response) => {
  sendSuccess(res, { user: req.user ?? null });
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  sendSuccess(res, null);
});

export default router;
