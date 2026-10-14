import { handlers } from "@/lib/nextauth";

// Vercel-də serverless funksiyaların stabil işləməsi üçün vacibdir
export const runtime = "nodejs";
export const { GET, POST } = handlers;