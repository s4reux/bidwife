import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const fd = await req.formData();
  const files = fd.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "Fayl seçilməyib" }, { status: 400 });

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 10 * 1024 * 1024) continue;

    const buf = Buffer.from(await file.arrayBuffer());

    // 🎯 Şəkli optimallaşdır + resize et
    // Max 1200x1200, WebP format, keyfiyyət 85
    const optimized = await sharp(buf)
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const name = randomUUID() + ".webp";
    await writeFile(join(dir, name), optimized);
    urls.push("/uploads/" + name);
  }

  if (!urls.length)
    return NextResponse.json({ error: "Şəkil yüklənmədi (max 10MB, JPG/PNG/WebP)" }, { status: 400 });

  return NextResponse.json({ urls });
}