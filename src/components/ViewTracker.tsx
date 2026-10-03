"use client";
import { useEffect } from "react";

export default function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed_${listingId}`;
    const lastView = localStorage.getItem(key);
    const now = Date.now();

    // Son 1 saat ərzində baxıbsa, yenidən saymırıq
    if (lastView && now - Number(lastView) < 60 * 60 * 1000) return;

    fetch(`/api/listings/${listingId}/view`, { method: "POST" });
    localStorage.setItem(key, String(now));
  }, [listingId]);

  return null;
}