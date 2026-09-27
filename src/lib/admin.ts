import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");
  return user;
}