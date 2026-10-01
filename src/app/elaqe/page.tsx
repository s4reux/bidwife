import Link from "next/link";

export const metadata = { title: "Əlaqə — BidWife" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="bg-white rounded-2xl border p-6 md:p-10">
        <Link href="/" className="text-sm text-orange-600 hover:underline">← Ana səhifə</Link>
        <h1 className="text-3xl font-black mt-4 mb-6">Əlaqə</h1>
        <p className="text-gray-600 mb-6">Suallarınız var? Bizimlə əlaqə saxlayın:</p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl">📧</div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Email</div>
              <a href="mailto:info@bidwife.az" className="text-orange-600 hover:underline font-semibold">
                info@bidwife.az
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl">📞</div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Telefon</div>
              <a href="tel:+994501234567" className="text-orange-600 hover:underline font-semibold">
                +994 50 123 45 67
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl">📍</div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Ünvan</div>
              <div className="font-semibold">Bakı, Azərbaycan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}