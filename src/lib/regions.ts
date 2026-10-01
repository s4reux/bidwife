export const CITIES = [
  "Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Şirvan",
  "Naxçıvan", "Şəki", "Yevlax", "Lənkəran", "Xankəndi",
  "Naftalan", "Şuşa", "Xaçmaz", "Quba", "Qusar",
];

export const RAYONS = [
  "Abşeron", "Ağcabədi", "Ağdam", "Ağdaş", "Ağstafa", "Ağsu",
  "Astara", "Balakən", "Bərdə", "Beyləqan", "Biləsuvar",
  "Cəbrayıl", "Cəlilabad", "Daşkəsən", "Füzuli", "Gədəbəy",
  "Goranboy", "Göyçay", "Göygöl", "Hacıqabul", "İmişli",
  "İsmayıllı", "Kəlbəcər", "Kürdəmir", "Qax", "Qazax",
  "Qəbələ", "Qobustan", "Qubadlı", "Laçın", "Lerik",
  "Masallı", "Neftçala", "Oğuz", "Saatlı", "Sabirabad",
  "Salyan", "Samux", "Siyəzən", "Şabran", "Şamaxı",
  "Şəmkir", "Tərtər", "Tovuz", "Ucar", "Xızı",
  "Xocalı", "Xocavənd", "Yardımlı", "Zaqatala", "Zəngilan", "Zərdab",
];

export const NAXCHIVAN = [
  "Babək", "Culfa", "Kəngərli", "Ordubad", "Sədərək", "Şahbuz", "Şərur",
];

export const ALL_REGIONS_SORTED = [
  ...new Set([...CITIES, ...RAYONS, ...NAXCHIVAN]),
].sort((a, b) => a.localeCompare(b, "az"));

export const ALL_REGIONS_WITH_DIGER = [...ALL_REGIONS_SORTED, "Digər"];