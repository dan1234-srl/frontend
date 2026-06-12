## Optimizare cele 8 pagini admin + AdminOrderDetail

Toate paginile folosesc deja fetch direct (`API_BASE_URL`), NU Supabase. Niciuna nu are modale Radix — fie nu au modale, fie folosesc panouri full-screen custom (`AdminEmailTemplates`) sau hover-overlays (`AdminThemeSettings`).

### Pattern aplicat uniform pentru toate

**Performanță (SWR + sessionStorage)**
- Înlocuiesc `useEffect + fetch + setState` cu `useAdminSWR(key, fetcher)` din `src/lib/admin-swr.ts`.
- Cheia per pagină: `admin:<resource>:<paramsHash>` (de ex. `admin:reviews:status=pending|page=1|q=...`).
- TTL 60s pentru liste, 120s pentru detalii statice (theme, email templates).
- Rezultat: pe revisit + 2G/3G pagina apare instant din sessionStorage; revalidare în background.

**Tematică vizuală — aceeași ca pe Dashboard/Products/Orders**
- Card containers cu `rounded-[28px] border border-zinc-100 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_30px_60px_-30px_rgba(16,0,43,0.12)]`.
- Eyebrow `text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]` + heading-serif title.
- Skeleton-uri în loc de `Loader2` central (zero CLS).
- Iconițe în pastile colorate cu `bg-[color]/10 text-[color]`, accent `var(--royal-violet)`.

**Animații (fără jitter)**
- Container principal `motion.div` cu fade+`y:8→0`, durată 200ms, ease `[0.22,1,0.36,1]`.
- Liste cu `staggerChildren: 0.03` pe primele 8 iteme, după care fără animație (pentru perf).
- `useReducedMotion` respectat.

**Modale → AdminDialog / AdminDialogShell**
- Toate panourile/popup-urile devin `AdminDialog` (cu eyebrow/title/footer) sau `AdminDialogShell` (când e nevoie de control total — ex. editor full-screen).
- Mobile = bottom-sheet cu drag-to-close (deja implementat în shell-ul nou).
- Confirmări (delete, etc.) folosesc `AdminDialog` size `sm` în loc de `confirm()` native.

---

### Per pagină — modificări specifice

**1. CollectionsAdmin.tsx** (589 linii)
- SWR: `admin:collections:list` + `admin:collections:<name>:products?page=N&q=...`.
- Layout nou: 2 coloane desktop (sidebar listă colecții 320px + panel produse). Mobile = drawer cu lista.
- Modal nou „Adaugă/Editează colecție" → `AdminDialog` size `md`.
- Confirmare ștergere → `AdminDialog` size `sm`.

**2. AdminImportFeed.tsx** (1478 linii — cel mai mare)
- SWR pentru sursele de import (`admin:import:sources`), preview (`admin:import:preview:<id>`), istoric (`admin:import:history`).
- WebSocket-ul de progres rămâne (real-time, nu beneficiază de cache).
- Modale: „Adaugă sursă" + „Editare mapping" + „Preview" → toate `AdminDialog`/`Shell` (size `lg` pentru mapping editor, `full` pentru preview).
- Split: extrag în 3 sub-componente (`<SourcesList>`, `<MappingEditor>`, `<PreviewPanel>`) — fiecare lazy via `React.lazy` pentru a tăia bundle inițial.

**3. AdminExportFeed.tsx** (295 linii)
- SWR `admin:export:feeds`.
- Card-uri cu acțiuni (Google Merchant / Facebook). Modal de configurare → `AdminDialog` size `md`.

**4. AdminReviews.tsx** (427 linii)
- SWR `admin:reviews:<status>:page=N:q=...`, `refreshInterval: 30s` pe tab Pending.
- Tab-bar (Pending / Approved / Rejected) cu indicator `layoutId` framer-motion.
- Modal „Vezi recenzie completă" cu acțiuni (Approve / Reject / Delete) → `AdminDialog` size `lg`.
- Confirmare ștergere → `AdminDialog` size `sm`.

**5. AdminWishlistAnalytics.tsx** (264 linii)
- SWR `admin:wishlist:trends:<range>`.
- Layout: KPI cards sus + grafic (Recharts deja folosit?) + tabel top-produse cu virtualizare la >50 rânduri (`@tanstack/react-virtual`).
- Modal „Detalii produs wishlist" → `AdminDialog` size `md`.

**6. AdminUsers.tsx** (423 linii)
- SWR `admin:users:page=N:q=...:role=...`.
- Modale: „Editare utilizator" (`AdminDialog` lg, cu tab-uri Profil/Rol/Sesiuni), „Resetare parolă" (sm), „Ștergere" (sm).
- Dropdown actions rămâne `DropdownMenu` shadcn.

**7. AdminThemeSettings.tsx** (617 linii)
- SWR `admin:theme:current` + cache local pentru preview live.
- Înlocuiesc hover-overlay-ul de la palete (line 569) cu un `AdminDialog` „Editor paletă" size `lg` care arată color-pickers + preview live.
- Modal „Aplică temă pe site" cu confirmare (sm).
- Salvarea folosește `useTransition` pentru a nu bloca UI-ul.

**8. AdminEmailTemplates.tsx** (409 linii)
- SWR `admin:email-templates:list` + `admin:email-template:<id>`.
- Înlocuiesc panoul full-screen custom (line 297 `fixed inset-0`) cu `AdminDialogShell` size `full` (capătă automat shell-ul cinematic — clip-path iris, halo, close extern).
- Preview live al template-ului în iframe sandbox, lazy-loaded.
- Modal „Trimite test" → `AdminDialog` size `md`.

**9. AdminOrderDetail.tsx** (517 linii) — redesign complet
- SWR `admin:order:<id>` + revalidate pe focus.
- Layout nou bazat pe pattern Dashboard:
  - **Hero header**: număr comandă, status pill, dată, total — pe fundal cu aurora subtilă violet.
  - **Grid 12 coloane**: stânga (8 col) = timeline + lista produse; dreapta (4 col) = client, adresă, plată, livrare, acțiuni.
  - **Timeline vertical** cu status-uri colorate (pending → confirmed → shipped → delivered).
  - **Card produse** cu imagini lazy + smart-image, nu Skeleton infinit.
- Acțiuni rapide („Marchează expediată", „Refund", „Trimite factură", „Vezi în GLS") → `AdminDialog` confirmări.
- Modal „Refund parțial" cu lista produselor → `AdminDialog` size `lg`.
- Mobile: sticky bottom action bar cu butoanele principale (în loc de butoane înghesuite în card-uri).

---

### Tehnic — fișiere atinse

- edited `src/pages/admin/CollectionsAdmin.tsx`
- edited `src/pages/admin/AdminImportFeed.tsx` (+ 3 sub-componente lazy)
- edited `src/pages/admin/AdminExportFeed.tsx`
- edited `src/pages/admin/AdminReviews.tsx`
- edited `src/pages/admin/AdminWishlistAnalytics.tsx`
- edited `src/pages/admin/AdminUsers.tsx`
- edited `src/pages/admin/AdminThemeSettings.tsx`
- edited `src/pages/admin/AdminEmailTemplates.tsx`
- edited `src/pages/admin/AdminOrderDetail.tsx`
- (eventual) created `src/components/admin/AdminConfirmDialog.tsx` — wrapper peste `AdminDialog` size sm pentru confirmări (Ștergi? / Aplici? / etc.) ca să nu mai dublez markup-ul

### Out of scope
- Nu schimb endpoint-urile API.
- Nu schimb shape-ul datelor returnate (doar consumarea în UI).
- Nu ating `AdminMessages`, `AdminGLS`, `AdminPages`, `AdminGeneralSettings` (nu sunt în meniul admin — separat dacă vrei).

### Verificare
- Build TS pass.
- Vizual: deschis fiecare din cele 9 pagini desktop (1311px) + mobile (375px).
- Network throttling 3G: prima vizită = skeleton scurt, a doua vizită = instant din cache.
- `prefers-reduced-motion: reduce` → fallback fade simplu.
- Toate modalele se închid cu Esc + click pe overlay + drag-down (mobile).

### Ordine de execuție propusă
Mergem în 3 loturi paralele logic, ca să poți testa pe parcurs:
1. **Lot rapid** (mici, impact mare): `AdminExportFeed`, `AdminWishlistAnalytics`, `AdminReviews`, `AdminUsers`
2. **Lot OrderDetail + Collections** (redesign vizibil): `AdminOrderDetail`, `CollectionsAdmin`
3. **Lot greu** (editori complexi): `AdminThemeSettings`, `AdminEmailTemplates`, `AdminImportFeed`

Confirmi ordinea sau preferi alta?
