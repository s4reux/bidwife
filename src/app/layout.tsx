import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import WinModal from "@/components/WinModal";
import AuctionCron from "@/components/AuctionCron";

export const metadata = {
  title: "BidWife — Al, sat, auksion et",
  description: "Azərbaycanın müasir onlayn bazarı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="antialiased">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6 min-h-[calc(100vh-140px)]">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-8">
          © {new Date().getFullYear()} BidWife — Bütün hüquqlar qorunur
        </footer>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <WinModal />
        <AuctionCron />
      </body>
    </html>
  );
}