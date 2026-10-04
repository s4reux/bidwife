"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav({
  loggedIn,
  unreadMsgs,
}: {
  loggedIn: boolean;
  unreadMsgs: number;
}) {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (!loggedIn) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavCount(d.ids?.length || 0))
      .catch(() => {});
  }, [loggedIn, pathname]);

  // Chat, elan detal səhifələrində göstərmə
  if (pathname?.startsWith("/mesajlar/")) return null;
  if (pathname?.match(/^\/elan\/[^/]+$/) && !pathname?.endsWith("/yeni")) return null;
  if (pathname?.endsWith("/duzenle")) return null;

  const items = [
    { href: "/", label: "Əsas", icon: "🏠" },
    { href: "/favoriler", label: "Seçilmişlər", icon: "❤️", badge: favCount },
    { href: "/elan/yeni", label: "Yeni elan", icon: "plus", big: true },
    { href: "/mesajlar", label: "Mesajlar", icon: "💬", badge: unreadMsgs },
    { href: "/kabinet", label: "Kabinet", icon: "👤" },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 relative max-w-lg mx-auto">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          if (item.big) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 grid place-items-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform">
                  <span className="text-white text-3xl font-light leading-none">+</span>
                </div>
                <span className="text-[10px] text-gray-700 mt-1 font-medium">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <div className="relative">
                <span className={`text-xl leading-none ${active ? "" : "opacity-50"}`}>
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] leading-none ${
                  active ? "text-orange-600 font-bold" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}