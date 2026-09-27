import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import Chat from "./Chat";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) redirect("/giris");

  const conv = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true, images: true } },
    },
  });
  if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id)) notFound();

  const other = conv.userAId === me.id ? conv.userB : conv.userA;

  return (
    <Chat
      conversationId={conv.id}
      meId={me.id}
      otherName={other.name}
      listing={conv.listing ? { id: conv.listing.id, title: conv.listing.title } : null}
    />
  );
}