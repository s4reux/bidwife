import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}
export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h);
}
export async function signToken(payload: { uid: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { uid: string; email: string };
  } catch {
    return null;
  }
}