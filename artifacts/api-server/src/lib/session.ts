import crypto from "crypto";

const sessions = new Map();

export function createSession({ user }: any) {
  const sid = crypto.randomBytes(24).toString("hex");
  sessions.set(sid, { user });
  return sid;
}

export function getSession(sid: string) {
  return sessions.get(sid);
}

export function getSessionId(req: any) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const match = cookie.match(/sid=([^;]+)/);
  return match ? match[1] : null;
}

export async function clearSession(res: any, sid: string) {
  sessions.delete(sid);
}
