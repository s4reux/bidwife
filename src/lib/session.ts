import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyToken } from "./auth";

export async function getCurrentUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({
    where: { id: payload.uid },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      isAdmin: true,
      emailVerified: true,
    },
  });
}