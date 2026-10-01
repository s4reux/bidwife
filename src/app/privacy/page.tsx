import Link from "next/link";

export const metadata = { title: "Məxfilik Siyasəti — BidWife" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="bg-white rounded-2xl border p-6 md:p-10">
        <Link href="/" className="text-sm text-orange-600 hover:underline">← Ana səhifə</Link>
        <h1 className="text-3xl font-black mt-4 mb-2">Məxfilik Siyasəti</h1>
        <p className="text-sm text-gray-500 mb-8">
          Son yenilənmə: {new Date().toLocaleDateString("az-AZ")}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Hansı Məlumatları Toplayırıq?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Qeydiyyat məlumatları:</b> Ad, email, telefon nömrəsi, şifrə (şifrələnmiş)</li>
              <li><b>Elan məlumatları:</b> Başlıq, təsvir, şəkillər, qiymət, şəhər</li>
              <li><b>Texniki məlumatlar:</b> IP ünvanı, brauzer, cihaz</li>
              <li><b>Fəaliyyət:</b> Baxdığınız elanlar, mesajlar, təkliflər</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Məlumatları Nə Üçün İstifadə Edirik?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Xidmətin göstərilməsi (elan yerləşdirmə, auksion)</li>
              <li>Təhlükəsizlik (saxta hesabların qarşısını almaq)</li>
              <li>İstifadəçi dəstəyi</li>
              <li>Bildirişlər (yeni mesaj, auksion bitməsi)</li>
              <li>Statistika (anonim, xidmətin yaxşılaşdırılması)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Məlumatları Kimlərlə Paylaşırıq?</h2>
            <p>Məlumatlarınızı <b>üçüncü şəxslərə satmırıq</b>. Yalnız aşağıdakı hallarda paylaşırıq:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Digər istifadəçilərlə:</b> Ad, elan məlumatları, telefon (yalnız auksion qalibinə)</li>
              <li><b>Xidmət provayderləri:</b> Ödəniş, hostinq, email (məxfi müqavilə ilə)</li>
              <li><b>Hüquq-mühafizə orqanları:</b> Qanuni tələb olduqda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Şifrə və Təhlükəsizlik</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Şifrələr <b>bcrypt</b> ilə şifrələnir — heç kim oxuya bilməz</li>
              <li>Bütün əlaqə <b>HTTPS</b> ilə şifrələnir</li>
              <li>Ödəniş məlumatları bizdə saxlanmır — banka ötürülür</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookie-lər</h2>
            <p>
              Sayt sessiyanızı saxlamaq üçün cookie istifadə edir. Cookie-lər brauzer
              parametrlərindən silinə bilər.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Hüquqlarınız</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hesabınızı silmək hüququnuz var</li>
              <li>Məlumatlarınızı görmək, düzəltmək hüququnuz var</li>
              <li>Kabinətdən istənilən vaxt çıxa bilərsiniz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Uşaqların Məxfiliyi</h2>
            <p>
              18 yaşdan kiçik şəxslər qeydiyyatdan keçə bilməz. Əgər belə hal aşkar
              edilərsə, hesab silinəcək.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Dəyişikliklər</h2>
            <p>Bu siyasət dəyişə bilər. Əhəmiyyətli dəyişikliklər email ilə bildiriləcək.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Əlaqə</h2>
            <p>
              Məxfiliklə bağlı suallar:{" "}
              <a href="mailto:privacy@bidwife.az" className="text-orange-600 hover:underline">
                privacy@bidwife.az
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}