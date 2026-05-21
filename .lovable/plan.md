## Obiectiv

Pagini de categorii și produs care se simt **instant** chiar și pe 3G, **zero layout shift**, **fără Supabase**, și un `App.tsx` care nu mai re-randează jumătate din arbore la fiecare navigare.

---

## 1. `App.tsx` — sursa principală de lag

Probleme actuale:

- `<Routes>` este randat **de două ori** (o dată pentru admin, o dată în `AnimatePresence` pentru public). React Router parcurge ambele arbori la fiecare navigare.
- `PageWrapper` aplică `motion.div` cu opacity tween de 500ms pe **fiecare** rută → la fiecare click se „înnegurează” pagina înainte să apară conținutul.
- `QueryClient` instanțiat fără config → fără cache useful, fără stale time, retry-uri agresive.
- `AnimatePresence mode="wait"` forțează demontarea completă a paginii vechi înainte să apară cea nouă → lag perceput.

Modificări:

- Un singur `<Routes>` cu admin/public unificate. Animația rămâne, dar fără `mode="wait"` și cu durată 0.2s + `will-change: opacity`.
- `QueryClient` cu `staleTime: 60s`, `gcTime: 5min`, `refetchOnWindowFocus: false`, `retry: 1`.
- `PageLoader` fullscreen înlocuit cu **null fallback** + skeletons per pagină (deja există `ProductGridSkeleton`, `ProductDetailSkeleton`).
- Provider tree comprimat (Theme/Language/Auth/Cart/Filters/Tooltip) într-un singur `<AppProviders>` pentru claritate, fără re-renduri suplimentare.

---

## 2. TanStack Query — da, mută-te complet pe el

În cod aproape totul folosește `fetch` în `useEffect` cu `useState` (CategoryPage, ProductDetail, ProductCarousel, FiltersContext, etc.). Asta înseamnă:

- la fiecare navigare înapoi se refetch-uiește tot,
- nimic nu se partajează între componente,
- nu există background refetch sau dedupe.

Tot ce migrez la `useQuery`:


| Hook nou                    | Endpoint                  | Stale |
| --------------------------- | ------------------------- | ----- |
| `useProducts(slug, params)` | `/products/filter`        | 60s   |
| `useProduct(idOrSlug)`      | `/products/:id`           | 5min  |
| `useCategoryFilters(slug)`  | `/products/filters/:slug` | 10min |
| `useCategoriesTree()`       | `/categories/tree`        | 1h    |
| `useCarousel(categorySlug)` | `/products?limit=20`      | 5min  |
| `useVouchersTicker()`       | `/vouchers/active-ticker` | 5min  |


Avantaje concrete:

- Click pe un produs din carousel → `useProduct` găsește deja datele prefetched, **detail pagina apare instant**, fără spinner.
- Navigare înapoi pe categorie → grila e deja în cache, **fără reflow**.
- Prefetch on `mouseenter` / `pointerdown` pe link-uri (carousel + grid).

Înlocuiește `src/lib/prefetch.ts` (Map manual) cu `queryClient.prefetchQuery` — same API, integrat.

---

## 3. Imagini — zero layout shift + livrare instant

Probleme acum:

- `SmartImage` setează `transition-opacity` 700ms → imaginea „pulsează” la apariție = lag perceput.
- `ProductCard` are `aspect-[3/4]` pe wrapper dar `<img>` din `SmartImage` **nu are `width`/`height` HTML** și nici `absolute inset-0 w-full h-full`. Pe layout-uri unde wrapper-ul nu impune aspect-ratio strict, asta = CLS.
- `optimizeImageUrl` folosește `images.weserv.nl` (proxy public, fără SLA). Tu zici că ai CDN Cloudflare → trebuie folosit Cloudflare Images / Cloudflare Image Resizing.
- Fără `<link rel="preload">` pentru imaginea LCP (hero banner pe `/` + prima imagine produs pe `/product/:id`).

Modificări:

1. **Helper unic `cfImg(url, { w, h, q, fit })**` care construiește URL-uri prin Cloudflare:
  ```
   https://<domeniu>/cdn-cgi/image/w=400,h=533,fit=cover,format=auto,quality=80/<source>
  ```
   `format=auto` → AVIF/WebP automat pentru clientul curent. Pe 3G ușor 5-8× mai mic decât JPG/PNG original.
   Variabilă nouă: `VITE_CF_IMAGE_BASE` (ex: `https://cdn.evem.ro`).
2. `**SmartImage` rescris**:
  - acceptă `width`/`height` ca props obligatorii pe variantele non-fluid,
  - generează `srcset` + `sizes` automat din `cfImg` (320, 480, 640, 800, 1200),
  - LQIP devine `cfImg(url, { w: 24, blur: 60 })` inline ca `background-image` pe wrapperul cu `aspect-ratio` fix → **zero CLS**, blur dispare când imaginea reală decodează,
  - fără `transition-opacity` (apariție instant cu LQIP underneath),
  - `decoding="async"`, `fetchpriority` doar pe LCP,
  - pe `<img>`: `style={{ aspectRatio: '<w>/<h>' }}` pentru intrinsic sizing.
3. `**ProductCard**`: wrapper cu `aspect-[3/4]` rămâne, dar imaginea primește `w-full h-full object-cover absolute inset-0`. Skeleton folosit doar dacă LQIP lipsește.
4. **Preload LCP**: în `<HomeHero>` / `<ProductDetail>` injectez la mount:
  ```html
   <link rel="preload" as="image"
         imagesrcset="..."
         imagesizes="100vw"
         fetchpriority="high" />
  ```
   (via `react-helmet`-less efect direct pe `document.head`).
5. **Preconnect** în `index.html` la `VITE_CF_IMAGE_BASE` + la `VITE_API_URL`.

---

## 4. CategoryPage — instant feel

- Trece pe `useProducts` cu `keepPreviousData: true` → când schimbi filtru, grila veche rămâne vizibilă cu un subtle overlay (fără să sară layout-ul).
- `ProductGridSkeleton` afișat **doar la prima încărcare** (fără cache); pentru filtre se folosește `isFetching` cu overlay.
- Sticky bar deja are blur — corect; dar elimin overflow-uri redundante și sticky duplicat pe mobile categories bar.
- Mobile: full responsive audit — grid `grid-cols-2` pe < `sm`, `sm:grid-cols-2`, `md:grid-cols-3`, `lg:grid-cols-3`, `xl:grid-cols-4`, gap-uri reduse pe mobile (`gap-x-3 gap-y-8`).
- Tipografie titlu categorie: `text-3xl sm:text-5xl md:text-6xl` (acum sare de la 4xl direct la 6xl).
- Sidebar desktop ascuns sub `xl` (sub 1280 cele 3 coloane + sidebar nu mai încap → înghesuial).

---

## 5. ProductDetail — instant pe click

- `useProduct` returnează cache hit dacă a fost prefetched din carousel/grid → **zero spinner**.
- `ProductImageGallery`: imaginea principală preload cu `fetchpriority="high"` + `cfImg w=800`, miniaturile `w=120`.
- Wrapper galerie fix `aspect-square` cu skeleton CSS pur (no JS) ca să elimine CLS.
- ProductInfo: rezervă spațiu pentru badge-uri/price chiar dacă datele lipsesc (placeholder `min-h-[28px]`).
- ProductCarousel „Produse Similare” cu `enabled: !!product.category?.slug` și prefetch on hover.

---

## 6. Eliminare Supabase

Fișiere/dependențe de șters:

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml` (rămâne directorul gol → îl șterg)
- `.env`: scot `VITE_SUPABASE_*`
- `package.json`: scot `@supabase/supabase-js`
- Grep final → confirm că nu mai există niciun import.

Adaug în `.env`:

```
VITE_CF_IMAGE_BASE=https://cdn.evem.ro
```

(tu vei seta valoarea reală a CDN-ului Cloudflare).

---

## 7. Cleanup extra

- `InitialLoader` cu `setTimeout(1200)` artificial → **eliminat**. Întârzie cu ~1s prima pagină degeaba.
- `nprogress` peste tot — păstrat dar declanșat doar pe navigarea între pagini cu durată > 200ms.
- `PageWrapper` `motion.div` cu opacity tranziție 0.5s pe toate paginile → **eliminat**, mut tranziția pe blocurile interne care chiar au nevoie (cards).
- `LanguageContext` / `AuthContext`: verific că nu fac fetch în providers la fiecare mount; mut pe `useQuery` cu `staleTime: Infinity` pentru auth bootstrap.

---

## Plan de execuție (în această ordine)

1. **Curățare Supabase** (5 fișiere șterse, `package.json` updated).
2. `**src/lib/cf-image.ts**` + rescriere `SmartImage` cu CLS-safe + srcset.
3. `**src/lib/queries.ts**` — hooks TanStack centralizate.
4. `**App.tsx**` comprimat: un singur Routes, QueryClient configurat, InitialLoader eliminat, PageWrapper subțire.
5. **CategoryPage / ProductDetail / Carousel** migrate pe queries + SmartImage nou.
6. `**index.html**`: preconnect CDN + API, eliminat fontul DM Sans nefolosit dacă nu apare în Tailwind (verific).
7. Test vizual viewport 375/768/1311.

---

## De confirmat de la tine

1. **Domeniul Cloudflare pentru imagini** — care e baza? (ex: `https://cdn.evem.ro` sau folosești Cloudflare Image Resizing direct pe domeniul principal `https://evem.ro/cdn-cgi/image/...`?). Fără asta, păstrez `weserv.nl` ca fallback temporar.
2. `@meilisearch/instant-meilisearch` **+** `react-instantsearch` — sunt folosite undeva? Dacă nu, le scot (≈ 200KB gzipped din bundle).
3. `**react-email-editor`, `recharts`, `qrcode.react`, `@react-google-maps/api**` — toate sunt admin-only? Confirm că rămân lazy (nu intră în bundle-ul public).

Răspunde-mi la cele 3 și dau drumul la execuție.  
  
baza e `https://assets.evem.ro , meilisearch il folosesc ca sa aduc datele din memorie cat mai repede (pentru categorypage, searchmodal etc). react-google-maps nu cred ca-l mai folosesc ,qrcode il folosesc la activare 2fa.`

&nbsp;