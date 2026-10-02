import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import WinModal from "@/components/WinModal";
import AuctionCron from "@/components/AuctionCron";
import VerifyBanner from "@/components/VerifyBanner";

export const metadata = {
  title: "BidWife — Al, sat, auksion et",
  description: "Azərbaycanın müasir onlayn bazarı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <VerifyBanner />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6">{children}</main>

        <footer className="border-t border-gray-100 bg-white mt-16">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <div className="font-black text-xl mb-3">
                  <span className="text-orange-600">Bid</span>
                  <span className="text-gray-900">Wife</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Azərbaycanın müasir onlayn elan və auksion platforması.
                </p>
              </div>

              <div>
                <div className="font-bold text-sm mb-3 text-gray-900">Platforma</div>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><Link href="/" className="hover:text-orange-600 transition-colors">Elanlar</Link></li>
                  <li><Link href="/?type=AUCTION" className="hover:text-orange-600 transition-colors">Auksionlar</Link></li>
                  <li><Link href="/kateqoriyalar" className="hover:text-orange-600 transition-colors">Kateqoriyalar</Link></li>
                  <li><Link href="/elan/yeni" className="hover:text-orange-600 transition-colors">Elan ver</Link></li>
                </ul>
              </div>

              <div>
                <div className="font-bold text-sm mb-3 text-gray-900">Şirkət</div>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li><Link href="/haqqinda" className="hover:text-orange-600 transition-colors">Haqqımızda</Link></li>
                  <li><Link href="/elaqe" className="hover:text-orange-600 transition-colors">Əlaqə</Link></li>
                  <li><Link href="/terms" className="hover:text-orange-600 transition-colors">İstifadə Şərtləri</Link></li>
                  <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">Məxfilik Siyasəti</Link></li>
                </ul>
              </div>

              <div>
                <div className="font-bold text-sm mb-3 text-gray-900">Əlaqə</div>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>
                    <a href="mailto:info@bidwife.az" className="hover:text-orange-600 transition-colors">
                      📧 info@bidwife.az
                    </a>
                  </li>
                  <li>
                    <a href="tel:+994501234567" className="hover:text-orange-600 transition-colors">
                      📞 +994 50 123 45 67
                    </a>
                  </li>
                  <li>📍 Bakı, Azərbaycan</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} BidWife — Bütün hüquqlar qorunur
              </p>
            </div>
          </div>
        </footer>

        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <WinModal />
        <AuctionCron />
      </body>
    </html>
  );
}