// Mapare oficială coduri GLS → text RO + categorie semantică.
// Sursa: Appendix G — GLS ParcelStatusList codes (1‑72).

export type GlsCategory =
  | "created"      // 51, 52, 1 – intrare în sistem
  | "transit"      // depou, tranzit, sortare
  | "out_delivery" // 32, 4 – iese la livrare
  | "delivered"    // 5, 54, 55, 58, 59
  | "stored"       // 6, 7, 53, 56, 8, 9, 69
  | "attention"    // refuzuri parțiale, dispute, lipsă info
  | "failed"       // nelivrat, refuzat de destinatar
  | "returned"     // 22, 23, 40
  | "damaged"      // 30, 31
  | "customs"      // 60‑72
  | "info";        // generic fallback

export interface GlsCodeMeta {
  text: string;
  category: GlsCategory;
}

export const GLS_STATUS_MAP: Record<string, GlsCodeMeta> = {
  "1":  { text: "Coletul a fost preluat de GLS",                         category: "created" },
  "2":  { text: "Coletul a părăsit centrul de sortare",                  category: "transit" },
  "3":  { text: "Coletul a ajuns în centrul de sortare",                 category: "transit" },
  "4":  { text: "Coletul este programat pentru livrare azi",             category: "out_delivery" },
  "5":  { text: "Coletul a fost livrat",                                 category: "delivered" },
  "6":  { text: "Coletul este depozitat în centrul de sortare",          category: "stored" },
  "7":  { text: "Coletul este depozitat în centrul de sortare",          category: "stored" },
  "8":  { text: "Coletul așteaptă ridicare personală (destinatar)",      category: "stored" },
  "9":  { text: "Coletul este depozitat pentru o nouă dată de livrare",  category: "stored" },
  "10": { text: "Scanare verificată. Totul în regulă",                   category: "info" },
  "11": { text: "Nu s-a livrat — destinatar plecat în concediu",         category: "failed" },
  "12": { text: "Nu s-a livrat — destinatar absent",                     category: "failed" },
  "13": { text: "Eroare de sortare la depou",                            category: "attention" },
  "14": { text: "Nu s-a livrat — recepție închisă",                      category: "failed" },
  "15": { text: "Nu s-a livrat — timp insuficient",                      category: "failed" },
  "16": { text: "Nu s-a livrat — destinatarul nu avea numerar (COD)",    category: "failed" },
  "17": { text: "Coletul a fost refuzat la livrare",                     category: "returned" },
  "18": { text: "Nu s-a livrat — sunt necesare detalii suplimentare",    category: "attention" },
  "19": { text: "Nu s-a livrat — condiții meteo nefavorabile",           category: "failed" },
  "20": { text: "Nu s-a livrat — adresă greșită sau incompletă",         category: "failed" },
  "21": { text: "Redirecționat — eroare de sortare",                     category: "attention" },
  "22": { text: "Coletul a fost trimis spre centrul de sortare",         category: "transit" },
  "23": { text: "Coletul a fost returnat expeditorului",                 category: "returned" },
  "24": { text: "Modificare livrare salvată în sistemul GLS",            category: "info" },
  "25": { text: "Redirecționat — rută greșită",                          category: "attention" },
  "26": { text: "Coletul a ajuns în centrul de sortare",                 category: "transit" },
  "27": { text: "Coletul a ajuns în centrul de sortare",                 category: "transit" },
  "28": { text: "Coletul a fost casat",                                  category: "damaged" },
  "29": { text: "Coletul este în investigare",                           category: "attention" },
  "30": { text: "Colet deteriorat la recepție",                          category: "damaged" },
  "31": { text: "Colet complet distrus",                                 category: "damaged" },
  "32": { text: "Coletul va fi livrat în cursul serii",                  category: "out_delivery" },
  "33": { text: "Nu s-a livrat — termen depășit",                        category: "failed" },
  "34": { text: "Refuzat — acceptarea întârziată",                       category: "returned" },
  "35": { text: "Refuzat — marfă necomandată",                           category: "returned" },
  "36": { text: "Destinatar absent, fără card de contact",               category: "failed" },
  "37": { text: "Modificare livrare la cererea expeditorului",           category: "info" },
  "38": { text: "Nu s-a livrat — aviz de însoțire lipsă",                category: "attention" },
  "39": { text: "Avizul de însoțire nu a fost semnat",                   category: "attention" },
  "40": { text: "Coletul a fost returnat expeditorului",                 category: "returned" },
  "41": { text: "Redirecționat normal",                                  category: "info" },
  "42": { text: "Coletul a fost casat la cererea expeditorului",         category: "damaged" },
  "43": { text: "Coletul nu poate fi localizat",                         category: "attention" },
  "44": { text: "Colet exclus din termenii și condițiile generale",      category: "attention" },
  "46": { text: "Modificare finalizată pentru adresa de livrare",        category: "info" },
  "47": { text: "Coletul a părăsit centrul de colete",                   category: "transit" },
  "51": { text: "Datele coletului au fost introduse în sistemul GLS",    category: "created" },
  "52": { text: "Datele COD au fost introduse în sistemul GLS",          category: "created" },
  "53": { text: "Tranzit între depouri",                                 category: "transit" },
  "54": { text: "Coletul a fost livrat la parcel box",                   category: "delivered" },
  "55": { text: "Coletul a fost livrat la ParcelShop / Locker",          category: "delivered" },
  "56": { text: "Colet depozitat în GLS ParcelShop",                     category: "stored" },
  "57": { text: "Timp maxim de stocare în ParcelShop atins",             category: "attention" },
  "58": { text: "Coletul a fost livrat unui vecin (semnătură)",          category: "delivered" },
  "59": { text: "Coletul a fost ridicat din ParcelShop",                 category: "delivered" },
  "60": { text: "Vămuire întârziată — factură lipsă",                    category: "customs" },
  "61": { text: "Documentele de vamă sunt în pregătire",                 category: "customs" },
  "62": { text: "Vămuire întârziată — telefon destinatar indisponibil",  category: "customs" },
  "64": { text: "Coletul a fost eliberat din vamă",                      category: "customs" },
  "65": { text: "Eliberat din vamă — vămuire la destinatar",             category: "customs" },
  "66": { text: "Vămuire întârziată — așteaptă aprobare destinatar",     category: "customs" },
  "67": { text: "Documentele de vamă sunt în pregătire",                 category: "customs" },
  "68": { text: "Nu s-a livrat — destinatarul refuză taxele vamale",     category: "customs" },
  "69": { text: "Depozitat în centrul de colete — expediție incompletă", category: "stored" },
  "70": { text: "Vămuire întârziată — documente incomplete",             category: "customs" },
  "71": { text: "Vămuire întârziată — documente lipsă/incorecte",        category: "customs" },
  "72": { text: "Datele de vamă urmează să fie înregistrate",            category: "customs" },
};

export interface CategoryStyle {
  label: string;
  dot: string;     // bg color for dot/pill
  text: string;    // text color
  bg: string;      // soft bg tint
  ring: string;    // ring color
}

export const CATEGORY_STYLE: Record<GlsCategory, CategoryStyle> = {
  created:      { label: "Înregistrat",   dot: "bg-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50",  ring: "ring-indigo-200" },
  transit:      { label: "În tranzit",    dot: "bg-blue-500",   text: "text-blue-600",   bg: "bg-blue-50",    ring: "ring-blue-200" },
  out_delivery: { label: "La curier",     dot: "bg-cyan-500",   text: "text-cyan-600",   bg: "bg-cyan-50",    ring: "ring-cyan-200" },
  delivered:    { label: "Livrat",        dot: "bg-emerald-500",text: "text-emerald-600",bg: "bg-emerald-50", ring: "ring-emerald-200" },
  stored:       { label: "În depozit",    dot: "bg-amber-500",  text: "text-amber-600",  bg: "bg-amber-50",   ring: "ring-amber-200" },
  attention:    { label: "Atenție",       dot: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50",  ring: "ring-orange-200" },
  failed:       { label: "Nelivrat",      dot: "bg-rose-500",   text: "text-rose-600",   bg: "bg-rose-50",    ring: "ring-rose-200" },
  returned:     { label: "Returnat",      dot: "bg-rose-600",   text: "text-rose-700",   bg: "bg-rose-50",    ring: "ring-rose-300" },
  damaged:      { label: "Deteriorat",    dot: "bg-red-600",    text: "text-red-700",    bg: "bg-red-50",     ring: "ring-red-300" },
  customs:      { label: "Vamă",          dot: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50",  ring: "ring-violet-200" },
  info:         { label: "Info",          dot: "bg-zinc-500",   text: "text-zinc-600",   bg: "bg-zinc-50",    ring: "ring-zinc-200" },
};

export function resolveGlsStatus(code: string | number | null | undefined): {
  code: string;
  meta: GlsCodeMeta;
  style: CategoryStyle;
} {
  const key = code != null ? String(code) : "";
  const meta = GLS_STATUS_MAP[key] || { text: "Status necunoscut", category: "info" as GlsCategory };
  return { code: key, meta, style: CATEGORY_STYLE[meta.category] };
}
