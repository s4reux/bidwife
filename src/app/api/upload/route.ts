export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const fd = await req.formData();
  const files = fd.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "Fayl seçilməyib" }, { status: 400 });

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 25 * 1024 * 1024) continue;

    const buf = Buffer.from(await file.arrayBuffer());

    const result = await imagekit.upload({
      file: buf,
      fileName: `listing_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`,
      folder: "/listings",
      useUniqueFileName: true,
    });

    urls.push(result.url);
  }

  if (!urls.length)
    return NextResponse.json({ error: "Şəkil yüklənmədi (max 25MB)" }, { status: 400 });

  return NextResponse.json({ urls });
}