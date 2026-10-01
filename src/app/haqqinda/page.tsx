import Link from "next/link";

export const metadata = { title: "Haqqımızda — BidWife" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="bg-white rounded-2xl border p-6 md:p-10">
        <Link href="/" className="text-sm text-orange-600 hover:underline">← Ana səhifə</Link>
        <h1 className="text-3xl font-black mt-4 mb-6">Haqqımızda</h1>

        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            <b>BidWife</b> — Azərbaycanın müasir onlayn elan və auksion platformasıdır.
            Məqsədimiz insanların mal və xidmətlərini asan, sürətli və etibarlı şəkildə
            satmasına kömək etməkdir.
          </p>
          <p>
            Saytımızda həm sabit qiymətlə, həm də auksion yolu ilə satış mümkündür.
            VIP elanlarla elanınızı daha çox insana çatdıra bilərsiniz.
          </p>

          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-3xl font-black text-orange-600">100%</div>
              <div className="text-xs text-gray-600 mt-1">Pulsuz elan</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-black text-blue-600">🔒</div>
              <div className="text-xs text-gray-600 mt-1">Təhlükəsiz</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-black text-green-600">⚡</div>
              <div className="text-xs text-gray-600 mt-1">Sürətli</div>
            </div>
          </div>

          <p>
            Əlaqə:{" "}
            <a href="mailto:info@bidwife.az" className="text-orange-600 hover:underline">
              info@bidwife.az
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}