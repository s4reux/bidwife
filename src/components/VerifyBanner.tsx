import { getCurrentUser } from "@/lib/session";
import Link from "next/link";

export default async function VerifyBanner() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.emailVerified) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3 text-sm">
        <span className="text-lg">⚠️</span>
        <span className="text-amber-800 flex-1">
          Emailinizi təsdiqləyin — bəzi funksiyalar məhduddur
        </span>
        <Link
          href="/tesdiqle"
          className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-700 whitespace-nowrap"
        >
          Təsdiqlə
        </Link>
      </div>
    </div>
  );
}