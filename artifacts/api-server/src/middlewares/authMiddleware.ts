import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "../lib/auth";
import { clearSession, getSessionId, getSession } from "../lib/auth";
import { sendError } from "../lib/response";

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user?: User | undefined;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const sid = getSessionId(req);
  if (!sid) {
    next();
    return;
  }

  const session = await getSession(sid);
  if (!session?.user?.id) {
    await clearSession(_res, sid);
    next();
    return;
  }

  req.user = session.user;
  next();
}

export function requireAuth(req: Request, res: Response): boolean {
  if (!req.user) {
    sendError(res, 401, "Not authenticated");
    return false;
  }
  return true;
}
