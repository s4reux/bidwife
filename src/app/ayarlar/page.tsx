import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <h1 className="text-2xl font-black mb-6">⚙️ Ayarlar</h1>
      <SettingsForm user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
      }} />
    </div>
  );
}