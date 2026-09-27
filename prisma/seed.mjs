import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const categories = [
  // Elektronika
  { name: "Telefonlar", slug: "telefonlar", emoji: "📱" },
  { name: "Komputerlər", slug: "komputerler", emoji: "💻" },
  { name: "Planşetlər", slug: "plansetler", emoji: "📲" },
  { name: "TV və Audio", slug: "tv-audio", emoji: "📺" },
  { name: "Oyun Konsolları", slug: "oyun-konsollari", emoji: "🎮" },
  { name: "Aksesuarlar", slug: "elektronika-aksesuar", emoji: "🎧" },

  // Nəqliyyat
  { name: "Avtomobillər", slug: "avtomobiller", emoji: "🚗" },
  { name: "Motosikletlər", slug: "motosikletler", emoji: "🏍️" },
  { name: "Ehtiyat Hissələri", slug: "ehtiyat-hisseleri", emoji: "🔧" },

  // Ev
  { name: "Mebel", slug: "mebel", emoji: "🛋️" },
  { name: "Məişət Texnikası", slug: "meiset-texnikasi", emoji: "🧺" },
  { name: "Bağ və Əkinçilik", slug: "bag-ekincilik", emoji: "🌱" },

  // Geyim
  { name: "Kişi Geyimi", slug: "kisi-geyimi", emoji: "👔" },
  { name: "Qadın Geyimi", slug: "qadin-geyimi", emoji: "👗" },
  { name: "Uşaq Geyimi", slug: "usaq-geyimi", emoji: "🧸" },
  { name: "Ayaqqabı", slug: "ayaqqabi", emoji: "👟" },

  // Uşaq
  { name: "Oyuncaqlar", slug: "oyuncaqlar", emoji: "🎁" },
  { name: "Uşaq Arabaları", slug: "usaq-arabalari", emoji: "🍼" },

  // İdman
  { name: "İdman Avadanlığı", slug: "idman", emoji: "⚽" },
  { name: "Velosipedlər", slug: "velosipedler", emoji: "🚴" },

  // Heyvanlar
  { name: "Ev Heyvanları", slug: "ev-heyvanlari", emoji: "🐾" },

  // Daşınmaz Əmlak
  { name: "Mənzillər", slug: "menziller", emoji: "🏢" },
  { name: "Evlər və Villalar", slug: "evler", emoji: "🏠" },
  { name: "Torpaq Sahələri", slug: "torpaq", emoji: "🌍" },

  // Digər
  { name: "Kitablar", slug: "kitablar", emoji: "📚" },
  { name: "Antikvar və Kolleksiya", slug: "antikvar", emoji: "🏺" },
  { name: "Musiqi Alətləri", slug: "musiqi-aletleri", emoji: "🎸" },
  { name: "İncəsənət", slug: "incesenet", emoji: "🎨" },
  { name: "Xidmətlər", slug: "xidmetler", emoji: "🛠️" },
  { name: "Digər", slug: "diger", emoji: "📦" },
];

async function main() {
  console.log("Kateqoriyalar yuklenir...");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji },
      create: c,
    });
    console.log("  ✓", c.emoji, c.name);
  }
  console.log(`\n✅ ${categories.length} kateqoriya hazirdir!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());