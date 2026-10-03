import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import WinModal from "@/components/WinModal";
import AuctionCron from "@/components/AuctionCron";
import VerifyBanner from "@/components/VerifyBanner";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "BidWife — Al, sat, auksion et",
  description: "Azərbaycanın müasir onlayn bazarı",
  openGraph: {
    title: "BidWife — Al, sat, auksion et",
    description: "Azərbaycanın müasir onlayn bazarı",
    type: "website",
    locale: "az_AZ",
    siteName: "BidWife",
  },
  twitter: {
    card: "summary_large_image",
    title: "BidWife",
    description: "Azərbaycanın müasir onlayn bazarı",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <Header />
          <VerifyBanner />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6">{children}</main>

          <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 mt-16">
            <div className="max-w-6xl mx-auto px-4 py-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="font-black text-xl mb-3">
                    <span className="text-orange-600">Bid</span>
                    <span className="text-gray-900 dark:text-white">Wife</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Azərbaycanın müasir onlayn elan və auksion platforması.
                  </p>
                </div>

                <div>
                  <div className="font-bold text-sm mb-3 text-gray-900 dark:text-white">Platforma</div>
                  <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <li><Link href="/" className="hover:text-orange-600">Elanlar</Link></li>
                    <li><Link href="/?type=AUCTION" className="hover:text-orange-600">Auksionlar</Link></li>
                    <li><Link href="/kateqoriyalar" className="hover:text-orange-600">Kateqoriyalar</Link></li>
                    <li><Link href="/elan/yeni" className="hover:text-orange-600">Elan ver</Link></li>
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-sm mb-3 text-gray-900 dark:text-white">Şirkət</div>
                  <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <li><Link href="/haqqinda" className="hover:text-orange-600">Haqqımızda</Link></li>
                    <li><Link href="/elaqe" className="hover:text-orange-600">Əlaqə</Link></li>
                    <li><Link href="/terms" className="hover:text-orange-600">İstifadə Şərtləri</Link></li>
                    <li><Link href="/privacy" className="hover:text-orange-600">Məxfilik Siyasəti</Link></li>
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-sm mb-3 text-gray-900 dark:text-white">Əlaqə</div>
                  <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <li><a href="mailto:info@bidwife.az" className="hover:text-orange-600">📧 info@bidwife.az</a></li>
                    <li><a href="tel:+994501234567" className="hover:text-orange-600">📞 +994 50 123 45 67</a></li>
                    <li>📍 Bakı, Azərbaycan</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  © {new Date().getFullYear()} BidWife — Bütün hüquqlar qorunur
                </p>
              </div>
            </div>
          </footer>

          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <WinModal />
          <AuctionCron />
        </ThemeProvider>
      </body>
    </html>
  );
}