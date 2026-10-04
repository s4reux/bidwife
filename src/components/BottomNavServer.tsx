import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import BottomNav from "./BottomNav";

export default async function BottomNavServer() {
  const user = await getCurrentUser();
  let unreadMsgs = 0;
  if (user) {
    unreadMsgs = await prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: { OR: [{ userAId: user.id }, { userBId: user.id }] },
      },
    });
  }
  return <BottomNav loggedIn={!!user} unreadMsgs={unreadMsgs} />;
}