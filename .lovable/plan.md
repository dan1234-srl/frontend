
# Pagină produs indisponibil — redesign profesional

## Problema
Când un produs indexat de Google nu mai există sau e out-of-stock, `ProductDetail.tsx` afișează:
- fallback urât "Produsul nu a fost găsit" (simplu text + link)
- sau, mai rău, produsul se randează cu preț `0`, stoc `0`, imagine goală → arată neprofesional și strică SEO.

## Ce construim

### 1. Componentă nouă `src/components/product/ProductUnavailable.tsx`
State-ul vizual pentru două cazuri:
- **`not_found`** — produsul nu există / a fost șters (404 de la backend sau date invalide: fără nume, fără preț)
- **`out_of_stock`** — produsul există dar `stock_quantity <= 0`

Design:
- Layout centrat pe toată lățimea, în tematica brandului (`--royal-violet`, `--dark-amethyst`, `--primary-gradient`, font serif italic pentru titlu — exact ca în `ProductInfo`).
- Icon animat mare (Sparkles/PackageX din lucide) cu pulse + gradient overlay.
- Titlu serif italic: „Această bijuterie și-a găsit deja stăpânul" (out of stock) sau „Piesă indisponibilă" (not found).
- Subtitlu explicativ scurt.
- Micro-animații: `animate-fade-in`, `animate-scale-in`, shimmer pe un card decorativ, pulse pe dot de status (reutilizează pattern-ul din `ProductInfo`).
- Două CTA-uri stilizate identic cu butoanele din site (h-16, uppercase, tracking-[0.4em], primary-gradient):
  - „Vezi produse similare" → link către categoria produsului (dacă avem slug) sau `/shop`
  - „Anunță-mă când revine" (doar out_of_stock) — buton secundar, opțional cu form email simplu (POST către un endpoint existent dacă există, altfel dezactivat cu tooltip "În curând")
- Secțiune inferioară: `ProductCarousel` cu „Alte piese din colecție" (dacă avem `categorySlug`) sau produse recomandate generice.
- Trust badges reutilizate (Truck / ShieldCheck) pentru continuitate vizuală.

### 2. Modificări în `src/pages/ProductDetail.tsx`
- Detectăm 3 stări clare după fetch:
  1. `loading` → skeleton (există)
  2. `notFound` → 404 real de la backend SAU `!data.name` → `<ProductUnavailable variant="not_found" />`
  3. `outOfStock` → `product.stock_quantity <= 0` → randăm normal ProductInfo/Gallery DAR cu overlay `<ProductUnavailable variant="out_of_stock" inline />` peste zona de preț/CTA, iar butonul "Adaugă în coș" e ascuns (deja e disabled, dar înlocuim cu mesaj frumos).
  
  Decizie: pentru `out_of_stock` păstrăm galeria + descrierea (util pentru SEO și utilizator), doar zona ProductInfo primește tratament special.

- SEO pentru `not_found`:
  - Setăm `<Seo>` cu `noindex` (props nou în `Seo.tsx`) + status 404 semantic (title „Produs indisponibil | Evem").
  - Pentru `out_of_stock` păstrăm JSON-LD dar cu `availability: OutOfStock` (deja e corect).

### 3. Extindere `src/components/Seo.tsx`
Adăugăm prop opțional `noindex?: boolean` care emite `<meta name="robots" content="noindex,follow" />`. Aplicat doar pe pagina not_found — previne ca Google să indexeze un URL mort ca fiind conținut valid.

### 4. Micro-detalii de robustețe în `ProductDetail.tsx`
- Verificare mai strictă: dacă `data && !data.name` sau `!data.price && !data.sale_price` → tratăm ca `not_found` (evită randarea urâtă cu preț 0 pe care ai descris-o).
- Fetch-ul deja setează `error=true` pe reject — extindem cu `notFound` separat de `error` real de rețea (opțional, retry pe error real).

## Ce NU atingem
- Nu modificăm backend-ul.
- Nu schimbăm `ProductInfo`, `ProductImageGallery`, `ProductDescription` — doar le condiționăm randarea.
- Nu atingem restul design system-ului.

## Fișiere
- **creat**: `src/components/product/ProductUnavailable.tsx`
- **editat**: `src/pages/ProductDetail.tsx` (logica de branch + import)
- **editat**: `src/components/Seo.tsx` (prop `noindex`)

## Întrebare rapidă înainte de build
Vrei buton „Anunță-mă când revine" funcțional (necesită un mic endpoint sau salvare în Supabase cu email) sau doar decorativ / ascuns? Dacă nu specifici, îl las **ascuns** și pun doar CTA-ul „Vezi produse similare" — cel mai curat vizual și fără dependințe noi.
