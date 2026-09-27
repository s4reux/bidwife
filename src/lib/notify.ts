import { prisma } from "./prisma";

export async function notify(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  return prisma.notification.create({
    data: { userId, type, title, body: body ?? null, link: link ?? null },
  });
}