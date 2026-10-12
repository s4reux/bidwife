import { handlers } from "@/lib/nextauth";

export const runtime = "nodejs";
export const { GET, POST } = handlers;