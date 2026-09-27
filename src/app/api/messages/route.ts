import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("conversationId");
  if (!cid) return NextResponse.json({ error: "ID yoxdur" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: cid } });
  if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id))
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  await prisma.message.updateMany({
    where: { conversationId: cid, senderId: { not: me.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const raw = await prisma.message.findMany({
    where: { conversationId: cid },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { sender: { select: { id: true, name: true } } },
  });

  // 🔑 HƏLL: isMine flag server-də hesablanır
  const messages = raw.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    senderId: m.senderId,
    senderName: m.sender.name,
    isMine: m.senderId === me.id,   // MÜTLƏQ server tərəfdə
  }));

  return NextResponse.json({ messages, meId: me.id });
}

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { conversationId, body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Bos mesaj" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id))
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  const otherId = conv.userAId === me.id ? conv.userBId : conv.userAId;

  const msg = await prisma.message.create({
    data: { conversationId, senderId: me.id, body: body.trim() },
    include: { sender: { select: { id: true, name: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  await notify(
    otherId, "NEW_MESSAGE", "Yeni mesaj",
    me.name + ": " + body.slice(0, 60),
    "/mesajlar/" + conversationId
  );

  return NextResponse.json({
    id: msg.id,
    body: msg.body,
    createdAt: msg.createdAt,
    senderId: msg.senderId,
    senderName: msg.sender.name,
    isMine: true,
  });
}