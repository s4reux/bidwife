"use client";
import { useEffect } from "react";

export default function AuctionCron() {
  useEffect(() => {
    fetch("/api/cron/auctions").catch(() => {});
    const t = setInterval(() => fetch("/api/cron/auctions").catch(() => {}), 30000);
    return () => clearInterval(t);
  }, []);
  return null;
}