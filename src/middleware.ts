import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🛡️ Yaddaşda rate limit (Vercel-də hər serverless nüsxəsi üçün ayrı)
const RATE_LIMIT = new Map<string, { count: number; reset: number }>();

const LIMITS: Record<string, { max: number; window: number }> = {
  "/api/auth/login": { max: 10, window: 60000 },        // 10 cəhd / dəq
  "/api/auth/register": { max: 5, window: 60000 },      // 5 qeydiyyat / dəq
  "/api/auth/forgot": { max: 3, window: 60000 },        // 3 sıfırlama / dəq
  "/api/auth/resend-code": { max: 3, window: 60000 },   // 3 göndərmə / dəq
  "/api/bids": { max: 30, window: 60000 },              // 30 təklif / dəq
  "/api/listings": { max: 10, window: 60000 },          // 10 elan / dəq
  "/api/upload": { max: 20, window: 60000 },            // 20 fayl / dəq
  "/api/messages": { max: 60, window: 60000 },          // 60 mesaj / dəq
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Hansı limitə uyğun gəlir?
  let limitConfig: { max: number; window: number } | null = null;
  for (const route of Object.keys(LIMITS)) {
    if (path.startsWith(route)) {
      limitConfig = LIMITS[route];
      break;
    }
  }

  if (!limitConfig) return NextResponse.next();

  // İstifadəçi identifikasiyası (IP)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = RATE_LIMIT.get(key);

  if (!entry || entry.reset < now) {
    RATE_LIMIT.set(key, { count: 1, reset: now + limitConfig.window });
    return NextResponse.next();
  }

  if (entry.count >= limitConfig.max) {
    return new NextResponse(
      JSON.stringify({
        error: "Çox cəhd etdiniz. Bir az sonra yenidən yoxlayın.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((entry.reset - now) / 1000)),
        },
      }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};