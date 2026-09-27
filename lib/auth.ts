import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is missing");
  return value;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function matchSecret(input: string, expected: string) {
  if (!expected) return false;
  const left = createHmac("sha256", "fairyglow").update(input).digest();
  const right = createHmac("sha256", "fairyglow").update(expected).digest();
  return timingSafeEqual(left, right);
}

function sign(payload: string) {
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function isAdmin() {
  const jar = await cookies();
  const token = jar.get("fg_session")?.value;
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (!safeEqual(sig, expected)) return false;
  const decoded = Buffer.from(payload, "base64url").toString();
  const [role, exp] = decoded.split(".");
  if (role !== "admin") return false;
  return Number(exp) > Date.now();
}

export function sessionToken() {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = Buffer.from(`admin.${exp}`).toString("base64url");
  return sign(payload);
}
