## Redesign AdminOrders + OrderReviewModal

### 1. AdminOrders.tsx — Bento Neo-Mosaic

**Layout grid (înlocuiește lista actuală)**
- CSS grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[180px] gap-4`.
- Pattern repetat la fiecare 6 card-uri: poziții 1 și 4 = `col-span-2` (wide), restul = 1x1 compact. Generat din index → mereu mozaic, nu uniformitate plictisitoare.
- Container card: `rounded-[24px] border border-zinc-100 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_40px_-24px_rgba(16,0,43,0.10)] hover:shadow-[0_30px_60px_-20px_rgba(16,0,43,0.18)] hover:-translate-y-0.5 transition`.

**Compact card (1x1)**
- Eyebrow violet `#ORD-...` + dată short.
- Nume client (truncate) + status pill colorat (pending=amber, processing=violet, shipped=blue, delivered=emerald, cancelled=zinc).
- Total mare jos-stânga `heading-serif text-2xl`, count items dreapta („3 pcs”).
- Bara accent pe muchia stângă 3px cu culoarea statusului.

**Wide card (2x1)**
- Stânga: aceleași info + sparkline mini (placeholder din timeline status: pending→...→delivered ca SVG 5 puncte, punctul activ glow).
- Dreapta: stack 3 thumbnails produs suprapuse (`-ml-3`, ring-2 white), badge `+N` dacă > 3.
- Hover reveal: rând acțiuni rapide (Vezi / AWB / Factură) cu clip-path inset → 0.

**Restul paginii**
- Header pagina (eyebrow + title heading-serif) + KPI strip (Total, Pending, Today's revenue) — 3 mini-card-uri sus.
- Filter bar: search debounced 300ms + status chips orizontale (Toate / Pending / Processing / Shipped / Delivered / Cancelled) cu `layoutId` indicator.
- Empty state ilustrat cu icon Sparkles, skeleton cards animate (nu Loader2 central).
- Paginare păstrată dar restilizată ca pill-uri.
- Migrare `useEffect+fetch` → `useAdminSWR` cu cheie `admin:orders:list:<page>:<q>:<status>`, TTL 60s, refresh background.

**Animații**
- Container `motion.div` fade+y:8→0, stagger 0.03 doar pe primele 8 card-uri.
- `useReducedMotion` respectat (fallback fade simplu).
- Hover GPU-only (transform + box-shadow).

**Mobile**
- 1 col, toate cardurile devin compact (fără wide), thumbnails ascunse, acțiuni sub formă de bottom-sheet la tap.

---

### 2. OrderReviewModal.tsx — Split Cinematic peste AdminDialogShell

**Bază**
- Înlocuiesc complet markup-ul propriu (overlay/wrapper custom) cu `AdminDialogShell` size `xl`, `mobileVariant="sheet"`. Păstrez toată logica (fetch order, save shipping, validări, GLS).
- Pe mobile = bottom-sheet drag-to-close (moștenit din shell).

**Layout desktop (grid 12 col)**
- Header intern: eyebrow violet `COMANDĂ • <data>`, titlu `heading-serif` cu `#ORD-...`, status pill mare animat, total în dreapta.
- Aurora subtilă în header (`radial-gradient` violet 6% opacity).
- Body grid:
  - **Stânga (col-span-7)**: timeline vertical status (5 pași: Plasată → Confirmată → Procesare → Expediată → Livrată) cu line gradient violet, punct activ glow + pulse; sub timeline → lista produse cu `<SmartImage>` lazy (card 84px imagine + nume + SKU + qty × preț + total). Fiecare item într-un mini-card rounded-2xl.
  - **Dreapta (col-span-5) sticky**: 4 sub-card-uri stack:
    1. Client (avatar inițiale + nume + email + phone).
    2. Livrare (tip: curier/locker, adresă completă sau nume locker; mini-buton „Vezi pe hartă" dacă locker).
    3. Plată (metoda + status).
    4. Sumar (subtotal, discount, shipping, **TOTAL** mare).
- Footer sticky cu acțiuni: `Salvează modificări` (primary violet) + `Anulează` + dropdown „Mai mult" (refund / factură / AWB).

**Mobile**
- Layout devine single column: header → timeline → produse → client → livrare → plată → sumar → acțiuni sticky bottom.

**Micro-detalii**
- Form-uri (editare adresă) inline în secțiunea Livrare, fără sub-modal.
- Skeleton split-screen la load (timeline + 2 produse + side panel).
- `useAdminSWR` cu cheie `admin:order:<id>`, TTL 30s.
- Confirmări (anulare AWB etc.) folosesc `AdminConfirmDialog` deja existent.

---

### 3. Tehnic

- edited `src/pages/admin/AdminOrders.tsx` (refactor major, păstrez logica fetch/cancel/GLS)
- edited `src/components/admin/OrderReviewModal.tsx` (rewrite UI, păstrez logica salvare/validare)
- nu se ating endpoint-uri sau shape-uri de date
- nu se ating alte pagini

### 4. Out of scope
- Restilizarea modalelor GLS din AdminOrders (istoric/cancel) — rămân pe `AdminDialogShell` curent.
- Nu adaug funcționalitate nouă (export, bulk actions).

### 5. Verificare
- Build TS pass.
- Vizual: desktop 1311px + mobile 375px, fiecare status simulat pentru culori.
- `prefers-reduced-motion` → fără stagger/halo.
- Modal: deschidere/închidere, Esc, click overlay, drag-down mobile.
