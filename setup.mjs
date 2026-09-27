import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const files = {};

files["package.json"] = `{
  "name": "bazar",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.3",
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.7.4",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "prisma": "^5.20.0",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2"
  }
}`;

files["tsconfig.json"] = `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;

files["next.config.js"] = `/** @type {import('next').NextConfig} */
module.exports = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};`;

files["tailwind.config.ts"] = `import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;`;

files["postcss.config.js"] = `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`;

files[".env"] = `DATABASE_URL="postgresql://postgres:parol@localhost:5432/bazar"
JWT_SECRET="cox-gizli-bir-soz-deyis-dir-bunu-1234567890"`;

files[".gitignore"] = `node_modules
.next
.env
.DS_Store`;

files["prisma/schema.prisma"] = `generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  password  String
  phone     String?
  isAdmin   Boolean   @default(false)
  createdAt DateTime  @default(now())
  listings  Listing[]
  bids      Bid[]
}

enum ListingType   { FIXED AUCTION }
enum ListingStatus { ACTIVE ENDED SOLD }

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  listings Listing[]
}

model Listing {
  id          String        @id @default(cuid())
  title       String
  description String
  price       Decimal       @db.Decimal(12, 2)
  type        ListingType   @default(FIXED)
  status      ListingStatus @default(ACTIVE)
  city        String?
  images      String[]
  auctionEnd  DateTime?
  createdAt   DateTime      @default(now())
  sellerId    String
  seller      User          @relation(fields: [sellerId], references: [id])
  categoryId  String?
  category    Category?     @relation(fields: [categoryId], references: [id])
  bids        Bid[]
  @@index([type, status])
  @@index([categoryId])
}

model Bid {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(12, 2)
  createdAt DateTime @default(now())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  @@index([listingId, amount])
}`;

files["src/lib/prisma.ts"] = `import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;`;

files["src/lib/auth.ts"] = `import bcrypt from "bcryptjs";
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
}`;

files["src/lib/session.ts"] = `import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyToken } from "./auth";

export async function getCurrentUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, email: true, name: true, phone: true, isAdmin: true },
  });
}`;

files["src/app/globals.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body { background: #f7f7f8; }`;

files["src/app/layout.tsx"] = `import "./globals.css";
import Header from "@/components/Header";

export const metadata = { title: "Bazar — Auksion & Elan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-8">
          © {new Date().getFullYear()} Bazar.az
        </footer>
      </body>
    </html>
  );
}`;

files["src/components/Header.tsx"] = `import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
        <Link href="/" className="font-extrabold text-2xl text-orange-600">Bazar</Link>
        <nav className="hidden md:flex gap-4 text-sm text-gray-700">
          <Link href="/" className="hover:text-orange-600">Hamisi</Link>
          <Link href="/?type=AUCTION" className="hover:text-orange-600">Auksionlar</Link>
          <Link href="/?type=FIXED" className="hover:text-orange-600">Sabit qiymet</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link href="/elan/yeni" className="bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700">
            + Elan ver
          </Link>
          {user ? (
            <>
              <Link href="/kabinet" className="hover:text-orange-600">{user.name}</Link>
              <form action="/api/auth/logout" method="POST">
                <button className="text-gray-500 hover:text-red-600">Cixis</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/giris" className="hover:text-orange-600">Giris</Link>
              <Link href="/qeydiyyat" className="hover:text-orange-600">Qeydiyyat</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}`;

files["src/components/ListingCard.tsx"] = `import Link from "next/link";

export default function ListingCard({ l }: { l: any }) {
  const price = Number(l.price).toFixed(2);
  const topBid = l.bids?.[0]?.amount ? Number(l.bids[0].amount).toFixed(2) : null;
  const ended = l.auctionEnd && new Date(l.auctionEnd) < new Date();

  return (
    <Link href={\`/elan/\${l.id}\`} className="bg-white rounded-lg border hover:shadow-md overflow-hidden flex flex-col">
      <div className="aspect-square bg-gray-100">
        {l.images?.[0] ? (
          <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-300">Sekil yox</div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="font-semibold line-clamp-2">{l.title}</div>
        <div className="text-xs text-gray-500 mt-1">{l.city || "—"}</div>
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className="text-orange-600 font-bold">{topBid ?? price} ₼</div>
          {l.type === "AUCTION" && (
            <span className={\`text-[11px] px-2 py-0.5 rounded \${ended ? "bg-gray-200 text-gray-600" : "bg-orange-100 text-orange-700"}\`}>
              {ended ? "Bitib" : "Auksion"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}`;

files["src/components/BidBox.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BidBox({
  listingId, minBid, loggedIn,
}: { listingId: string; minBid: number; loggedIn: boolean }) {
  const [amount, setAmount] = useState(+(minBid + 1).toFixed(2));
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  if (!loggedIn) {
    return (
      <p className="text-sm text-gray-500 mt-3">
        Teklif vermek ucun <Link href="/giris" className="text-orange-600">daxil ol</Link>.
      </p>
    );
  }

  async function place() {
    setLoading(true); setErr("");
    const res = await fetch("/api/bids", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, amount }),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    r.refresh();
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input type="number" step="0.01" min={minBid + 0.01} value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 rounded flex-1" />
        <button onClick={place} disabled={loading}
          className="bg-orange-600 text-white px-4 rounded hover:bg-orange-700 disabled:opacity-50">
          Teklif ver
        </button>
      </div>
      {err && <p className="text-red-600 text-xs mt-1">{err}</p>}
    </div>
  );
}`;

files["src/app/page.tsx"] = `import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";

export default async function Home({
  searchParams,
}: {
  searchParams: { type?: string; q?: string; cat?: string };
}) {
  const where: any = { status: "ACTIVE" };
  if (searchParams.type === "AUCTION") where.type = "AUCTION";
  if (searchParams.type === "FIXED") where.type = "FIXED";
  if (searchParams.q) where.title = { contains: searchParams.q, mode: "insensitive" };
  if (searchParams.cat) where.category = { slug: searchParams.cat };

  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true, bids: { orderBy: { amount: "desc" }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <form className="mb-6 flex gap-2">
        <input name="q" defaultValue={searchParams.q}
          placeholder="Ne axtarirSan?"
          className="flex-1 border rounded px-3 py-2 bg-white" />
        <button className="bg-orange-600 text-white px-5 rounded hover:bg-orange-700">Axtar</button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 text-sm">
          <a href="/" className="px-3 py-1 rounded-full border bg-white hover:border-orange-500">Hamisi</a>
          {categories.map((c) => (
            <a key={c.id} href={\`/?cat=\${c.slug}\`}
              className="px-3 py-1 rounded-full border bg-white hover:border-orange-500">{c.name}</a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map((l) => <ListingCard key={l.id} l={l} />)}
      </div>
      {listings.length === 0 && <p className="text-gray-500">Elan tapilmadi.</p>}
    </div>
  );
}`;

files["src/app/giris/page.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    r.push("/kabinet");
    r.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white max-w-sm mx-auto p-6 rounded-lg border space-y-4">
      <h1 className="text-xl font-bold">Giris</h1>
      <input name="email" type="email" required placeholder="Email" className="w-full border p-2 rounded" />
      <input name="password" type="password" required placeholder="Sifre" className="w-full border p-2 rounded" />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded disabled:opacity-50">
        {loading ? "..." : "Daxil ol"}
      </button>
      <p className="text-sm text-center text-gray-500">
        Hesabin yoxdur? <Link href="/qeydiyyat" className="text-orange-600">Qeydiyyat</Link>
      </p>
    </form>
  );
}`;

files["src/app/qeydiyyat/page.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"), email: fd.get("email"),
        phone: fd.get("phone"), password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    r.push("/kabinet"); r.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white max-w-sm mx-auto p-6 rounded-lg border space-y-4">
      <h1 className="text-xl font-bold">Qeydiyyat</h1>
      <input name="name" required placeholder="Ad Soyad" className="w-full border p-2 rounded" />
      <input name="email" type="email" required placeholder="Email" className="w-full border p-2 rounded" />
      <input name="phone" placeholder="Telefon (opsional)" className="w-full border p-2 rounded" />
      <input name="password" type="password" required minLength={6} placeholder="Sifre (min 6)" className="w-full border p-2 rounded" />
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded disabled:opacity-50">
        {loading ? "..." : "Qeydiyyatdan kec"}
      </button>
      <p className="text-sm text-center text-gray-500">
        Hesabin var? <Link href="/giris" className="text-orange-600">Giris</Link>
      </p>
    </form>
  );
}`;

files["src/app/kabinet/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [myListings, myBids] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
    }),
    prisma.bid.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: true },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
        <div>
          <div className="text-lg font-bold">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
        <Link href="/elan/yeni" className="bg-orange-600 text-white px-4 py-2 rounded">
          + Yeni elan
        </Link>
      </div>

      <section>
        <h2 className="font-bold text-lg mb-3">Menim elanlarim ({myListings.length})</h2>
        {myListings.length === 0 ? (
          <p className="text-gray-500">Hele elan yoxdur.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myListings.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-lg mb-3">Verdiyim teklifler ({myBids.length})</h2>
        {myBids.length === 0 ? (
          <p className="text-gray-500">Hele teklif yoxdur.</p>
        ) : (
          <div className="bg-white border rounded-lg divide-y">
            {myBids.map((b) => (
              <Link key={b.id} href={\`/elan/\${b.listingId}\`}
                className="flex justify-between p-3 hover:bg-gray-50">
                <span>{b.listing.title}</span>
                <span className="font-medium">{Number(b.amount).toFixed(2)} ₼</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}`;

files["src/app/elan/yeni/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import NewListingForm from "./form";

export default async function NewListing() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <NewListingForm categories={categories} />;
}`;

files["src/app/elan/yeni/form.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingForm({ categories }: { categories: { id: string; name: string }[] }) {
  const r = useRouter();
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErr("");
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      price: Number(fd.get("price")),
      city: fd.get("city") || null,
      categoryId: fd.get("categoryId") || null,
      type,
      auctionEnd: type === "AUCTION" ? fd.get("auctionEnd") : null,
      images: String(fd.get("images") || "").split("\\n").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch("/api/listings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) return setErr((await res.json()).error);
    const { id } = await res.json();
    r.push(\`/elan/\${id}\`); r.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-lg border space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Yeni elan</h1>

      <div className="flex gap-2">
        {(["FIXED", "AUCTION"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={\`px-4 py-2 rounded border \${type === t ? "bg-orange-600 text-white border-orange-600" : "bg-white"}\`}>
            {t === "FIXED" ? "Sabit qiymet" : "Auksion"}
          </button>
        ))}
      </div>

      <input name="title" required placeholder="Basliq" className="w-full border p-2 rounded" />
      <textarea name="description" required rows={4} placeholder="Tesvir" className="w-full border p-2 rounded" />

      <div className="grid grid-cols-2 gap-3">
        <input name="price" required type="number" step="0.01" placeholder={type === "AUCTION" ? "Baslangic qiymet" : "Qiymet"}
          className="border p-2 rounded" />
        <input name="city" placeholder="Seher" className="border p-2 rounded" />
      </div>

      <select name="categoryId" className="w-full border p-2 rounded">
        <option value="">Kateqoriya sec</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {type === "AUCTION" && (
        <div>
          <label className="text-sm text-gray-600">Auksion bitme tarixi</label>
          <input name="auctionEnd" required type="datetime-local" className="w-full border p-2 rounded" />
        </div>
      )}

      <textarea name="images" rows={3} placeholder="Sekil URL-leri (her setirde bir)" className="w-full border p-2 rounded" />

      {err && <p className="text-red-600 text-sm">{err}</p>}
      <button disabled={loading} className="bg-orange-600 text-white px-5 py-2 rounded disabled:opacity-50">
        {loading ? "Gonderilir..." : "Yerlesdir"}
      </button>
    </form>
  );
}`;

files["src/app/elan/[id]/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import BidBox from "@/components/BidBox";
import Link from "next/link";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, phone: true, email: true } },
      category: true,
      bids: { orderBy: { amount: "desc" }, include: { user: { select: { name: true } } }, take: 30 },
    },
  });
  if (!listing) notFound();

  const me = await getCurrentUser();
  const topBid = listing.bids[0]?.amount ?? null;
  const isAuction = listing.type === "AUCTION";
  const ended = listing.auctionEnd ? new Date(listing.auctionEnd) < new Date() : false;
  const isOwner = me?.id === listing.sellerId;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="aspect-square bg-gray-100 rounded overflow-hidden border">
          {listing.images[0] ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-300">Sekil yox</div>
          )}
        </div>
        {listing.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {listing.images.slice(1).map((src, i) => (
              <img key={i} src={src} alt="" className="aspect-square object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        {listing.category && (
          <Link href={\`/?cat=\${listing.category.slug}\`} className="text-xs text-orange-600">
            {listing.category.name}
          </Link>
        )}
        <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>

        <div className="text-sm text-gray-500 border-t pt-3">
          Satici: <span className="font-medium text-gray-800">{listing.seller.name}</span>
          {listing.city && <> • {listing.city}</>}
          {isOwner && listing.seller.phone && <> • ☎ {listing.seller.phone}</>}
        </div>

        <div className="border-t pt-4">
          {isAuction ? (
            <>
              <div className="text-sm text-gray-500">
                {ended ? "Auksion bitdi" : "Cari en yuksek teklif"}
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {Number(topBid ?? listing.price).toFixed(2)} ₼
              </div>
              {listing.auctionEnd && (
                <div className="text-xs text-gray-500 mt-1">
                  Bitme: {new Date(listing.auctionEnd).toLocaleString("az-AZ")}
                </div>
              )}

              {!ended && !isOwner && (
                <BidBox listingId={listing.id} minBid={Number(topBid ?? listing.price)} loggedIn={!!me} />
              )}
              {isOwner && <p className="text-xs text-gray-500 mt-2">Bu senin elanindir.</p>}
              {!me && !ended && (
                <p className="text-sm text-gray-500 mt-2">
                  Teklif vermek ucun <Link href="/giris" className="text-orange-600">daxil ol</Link>.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-orange-600">
                {Number(listing.price).toFixed(2)} ₼
              </div>
              {!isOwner && listing.seller.phone && me && (
                <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded">
                  Elaqe: <span className="font-bold">{listing.seller.phone}</span>
                </div>
              )}
              {!me && (
                <p className="text-sm text-gray-500 mt-2">
                  Elaqe ucun <Link href="/giris" className="text-orange-600">daxil ol</Link>.
                </p>
              )}
            </>
          )}
        </div>

        {isAuction && listing.bids.length > 0 && (
          <div className="border-t pt-3">
            <h2 className="font-semibold mb-2">Teklifler ({listing.bids.length})</h2>
            <ul className="text-sm space-y-1 max-h-60 overflow-auto">
              {listing.bids.map((b) => (
                <li key={b.id} className="flex justify-between border-b py-1">
                  <span>{b.user.name}</span>
                  <span className="font-medium">{Number(b.amount).toFixed(2)} ₼</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}`;

files["src/app/api/auth/register/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const s = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Melumat yanlisdir" }, { status: 400 });
  const { name, email, phone, password } = p.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Bu email artiq qeydiyyatdadir" }, { status: 400 });

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: await hashPassword(password) },
  });
  const token = await signToken({ uid: user.id, email: user.email });
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}`;

files["src/app/api/auth/login/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const s = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlis melumat" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!user || !(await verifyPassword(p.data.password, user.password)))
    return NextResponse.json({ error: "Email ve ya sifre yanlisdir" }, { status: 401 });

  const token = await signToken({ uid: user.id, email: user.email });
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}`;

files["src/app/api/auth/logout/route.ts"] = `import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  cookies().delete("token");
  return NextResponse.redirect(new URL("/", req.url));
}`;

files["src/app/api/auth/me/route.ts"] = `import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const u = await getCurrentUser();
  return NextResponse.json({ user: u });
}`;

files["src/app/api/listings/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  price: z.number().positive(),
  type: z.enum(["FIXED", "AUCTION"]),
  city: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  auctionEnd: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", ...(type ? { type: type as any } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });
  const d = p.data;

  const listing = await prisma.listing.create({
    data: {
      title: d.title, description: d.description, price: d.price,
      type: d.type, city: d.city ?? null, images: d.images,
      auctionEnd: d.auctionEnd ? new Date(d.auctionEnd) : null,
      categoryId: d.categoryId ?? null,
      sellerId: user.id,
    },
  });
  return NextResponse.json({ id: listing.id });
}`;

files["src/app/api/listings/[id]/route.ts"] = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id && !user.isAdmin)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}`;

files["src/app/api/bids/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({ listingId: z.string(), amount: z.number().positive() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlis melumat" }, { status: 400 });
  const { listingId, amount } = p.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });
  if (!listing || listing.type !== "AUCTION")
    return NextResponse.json({ error: "Auksion tapilmadi" }, { status: 404 });
  if (listing.sellerId === user.id)
    return NextResponse.json({ error: "Oz elanina teklif vere bilmezsen" }, { status: 400 });
  if (listing.auctionEnd && new Date(listing.auctionEnd) < new Date())
    return NextResponse.json({ error: "Auksion bitib" }, { status: 400 });

  const top = Number(listing.bids[0]?.amount ?? listing.price);
  if (amount <= top)
    return NextResponse.json({ error: \`Teklif \${top} AZN-den boyuk olmalidir\` }, { status: 400 });

  const bid = await prisma.bid.create({
    data: { listingId, amount, userId: user.id },
  });
  return NextResponse.json(bid);
}`;

let count = 0;
for (const [path, content] of Object.entries(files)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  count++;
  console.log("  ✓", path);
}

console.log(`\n✅ ${count} fayl yaradildi!`);
console.log("\n🚀 Sonra:");
console.log("   npm install");
console.log("   npx prisma db push");
console.log("   npm run dev");