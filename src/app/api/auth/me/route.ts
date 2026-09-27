import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const u = await getCurrentUser();
  return NextResponse.json({ user: u });
}