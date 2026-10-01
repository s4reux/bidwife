import Link from "next/link";

export const metadata = { title: "İstifadə Şərtləri — BidWife" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="bg-white rounded-2xl border p-6 md:p-10">
        <Link href="/" className="text-sm text-orange-600 hover:underline">← Ana səhifə</Link>
        <h1 className="text-3xl font-black mt-4 mb-2">İstifadə Şərtləri</h1>
        <p className="text-sm text-gray-500 mb-8">
          Son yenilənmə: {new Date().toLocaleDateString("az-AZ")}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Ümumi Müddəalar</h2>
            <p>
              BidWife (bundan sonra "Sayt") — Azərbaycan Respublikasında fəaliyyət göstərən
              onlayn elan və auksion platformasıdır. Saytdan istifadə etməklə siz aşağıdakı
              şərtləri tam qəbul etdiyinizi təsdiqləyirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Qeydiyyat</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Qeydiyyat zamanı doğru və dəqiq məlumat verməlisiniz.</li>
              <li>18 yaşdan kiçik şəxslər qeydiyyatdan keçə bilməz.</li>
              <li>Hesabın təhlükəsizliyi (şifrə) istifadəçinin məsuliyyətindədir.</li>
              <li>Bir istifadəçi yalnız bir hesab yarada bilər.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Elan Yerləşdirmə</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Yalnız qanuni yolla əldə edilmiş malları satmaq olar.</li>
              <li>Saxta, təhlükəli, qadağan olunmuş malların satışı qadağandır.</li>
              <li>Elan şəkilləri real mala aid olmalıdır.</li>
              <li>Bir elanın bir neçə dəfə yerləşdirilməsi (spam) qadağandır.</li>
              <li>Qadağan olunmuş kateqoriyalar: silah, narkotik, saxta sənədlər, canlı heyvanların qanunsuz ticarəti.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Auksion Qaydaları</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Auksionda təklif verən şəxs təklifi ilə bağlı öhdəlik götürür.</li>
              <li>Təklifi geri götürmək mümkün deyil.</li>
              <li>Auksion bitdikdən sonra qalib satıcı ilə əlaqə saxlamalıdır.</li>
              <li>Öz elanına təklif vermək qadağandır.</li>
              <li>Saxta təkliflər (qiymət qaldırmaq üçün) aşkar edilərsə, hesab bağlanır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. VIP Elanlar</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>VIP elanlar pullu xidmətdir və ana səhifədə üstdə göstərilir.</li>
              <li>Ödəniş geri qaytarılmır.</li>
              <li>VIP müddəti bitdikdən sonra elan normal siyahıya keçir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Məsuliyyət</h2>
            <p>
              Sayt yalnız alıcı və satıcı arasında vasitəçidir. Alqı-satqı əməliyyatı ilə bağlı
              yaranan mübahisələr birbaşa tərəflər arasında həll olunur. Sayt heç bir zərərə
              görə məsuliyyət daşımır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Hesabın Bağlanması</h2>
            <p>Sayt aşağıdakı hallarda hesabı xəbərdarlıq etmədən bağlamaq hüququnu saxlayır:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Saxta məlumat verilməsi</li>
              <li>Spam və ya qadağan olunmuş elanlar</li>
              <li>Digər istifadəçilərə qarşı təhqiramiz davranış</li>
              <li>Şərtlərin pozulması</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Əlaqə</h2>
            <p>
              Suallar üçün:{" "}
              <a href="mailto:info@bidwife.az" className="text-orange-600 hover:underline">
                info@bidwife.az
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}