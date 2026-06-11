# Plan: Unify admin modals on AdminDialog (mobile bottom-sheet + premium animations)

## Obiectiv
Toate dialogurile din `/admin` vor folosi o singură componentă `AdminDialog`, cu:
- pe **mobil** → bottom-sheet (slide up, drag handle, safe-area)
- pe **desktop** → modal centrat (ca acum, dar fără jitter)
- animații GPU-only (`transform` + `opacity`), fără layout shifts / scale pe overlay
- design unitar (eyebrow violet, titlu serif, footer sticky)

## Scope — fișiere atinse

Modale rămase de migrat (toate folosesc încă `<Dialog>` direct):

1. `src/pages/admin/AdminBrands.tsx` — 1 modal (create/edit brand)
2. `src/pages/admin/AdminCategories.tsx` — 1 modal (create/edit category)
3. `src/pages/admin/AdminAttributes.tsx` — 2 modale (usage + create/edit attribute)
4. `src/pages/admin/AdminCoupons.tsx` — 2 modale (voucher full-screen, banner)
5. `src/pages/admin/AdminProducts.tsx` — 1 modal mare (product editor full-screen)

Deja migrate (rămân ca referință, mici ajustări dacă apar): `AdminOrders.tsx`.

Componentă centrală:
- `src/components/admin/AdminDialog.tsx` — extindere (mobile bottom-sheet variant, size `full` pentru editorul de produs/voucher).

## Modificări la `AdminDialog`

Adăugiri (fără breaking changes pe call-site-urile existente):

- prop nou `size`: adăugat `"full"` (pentru product editor + voucher mare, `sm:max-w-[1200px]` / `h-[94vh]`).
- prop nou `mobileVariant?: "sheet" | "modal"` (default `"sheet"`).
  - când `sheet` și viewport `< 768px` (`useIsMobile`):
    - container ancorat jos: `fixed inset-x-0 bottom-0 top-auto translate-y-0`
    - colțuri `rounded-t-3xl rounded-b-none`
    - `max-h-[92vh]`, `pb-[env(safe-area-inset-bottom)]`
    - drag-handle vizual (bară `h-1.5 w-10 bg-zinc-200 rounded-full` în header)
    - animație: `y: 100% → 0` (slide-up), 220ms `cubic-bezier(.22,1,.36,1)`
  - pe desktop: comportament actual (centrat, fade + scale 0.98 → 1).
- override `DialogContent` animation classes pentru a evita „jitter":
  - înlocuim default Radix `data-[state=open]:zoom-in-95` cu transform pur (`translate-y`/`opacity`), durata 200ms, `will-change: transform, opacity`.
  - overlay: doar `opacity` (fără blur animat — evită repaint pe 2G/3G).
- footer mobil: deja `flex-col-reverse` — păstrat; butoanele primesc `h-12` pe mobil pentru tap-target.

## Pattern de migrare per modal

Fiecare ecran trece de la:
```tsx
<Dialog open={...}><DialogContent className="...">
  <header>...</header>
  <form>...</form>
  <DialogFooter>...</DialogFooter>
</DialogContent></Dialog>
```
la:
```tsx
<AdminDialog
  open={...}
  onOpenChange={...}
  eyebrow="Catalog"
  title="Brand nou"
  description="..."
  size="lg"            // sau "full" pentru products/voucher
  footer={<>...butoane...</>}
>
  <form>...</form>
</AdminDialog>
```

Reguli:
- header-ul custom existent (cu badge-uri/tabs) — dacă e bogat (Coupons voucher, Products), îl mutăm în `children` ca prim element sticky, iar `AdminDialog` primește `title` minim + `eyebrow`. Pentru voucher/product editor (care au tab-bar + acțiuni în header) folosim `size="full"` și înlocuim doar shell-ul (overlay, animație, scroll, footer sticky), păstrând conținutul intern intact.
- footer-ul existent → trecut prin prop `footer`.
- toate `DialogTitle`/`DialogDescription` interne se elimină (deja oferite de wrapper).
- importurile vechi `Dialog, DialogContent, DialogFooter, DialogTitle, DialogDescription` se șterg.

## Per-fișier — detalii cheie

**AdminBrands.tsx** — size `lg`, footer = Cancel + Save. Conținut: form simplu (nume, slug, logo upload). Eyebrow: "Catalog · Brand".

**AdminCategories.tsx** — size `lg`. Conținut form + parent picker. Eyebrow: "Catalog · Categorie".

**AdminAttributes.tsx** —
- Usage modal: size `md`, fără footer. Eyebrow: "Atribut · Utilizare".
- Edit modal: size `sm`, footer Save/Cancel.

**AdminCoupons.tsx** —
- Voucher modal: size `full`, `mobileVariant="sheet"`. Păstrăm tab-bar-ul intern (Setări / Design / Preview) ca sticky top în `children`. Footer = Save/Delete/Cancel.
- Banner modal: size `lg`, footer Save/Cancel.

**AdminProducts.tsx** — Product editor: size `full`. Header intern complex (tabs, status, AI buttons) rămâne ca sticky bar în `children`. Footer = Save / Cancel / Delete.

## Performanță & „premium feel"

- toate animațiile folosesc `transform` + `opacity` (no `width`/`height`/`filter` animate);
- `will-change` setat doar pe `data-[state=open]` și curățat după 220ms;
- `useReducedMotion` respectat → fără slide, doar opacity 120ms;
- conținutul intern primește `content-visibility: auto` pe secțiunile lungi din product/voucher pentru rendering rapid pe 2G/3G;
- nu se schimbă logica de business / fetch — doar shell-ul UI.

## Verificare după implementare
- build trece;
- preview: deschis fiecare modal pe mobil (375px) și desktop — fără salt vizual, fără layout shift, footer accesibil deasupra safe-area;
- nu rămân importuri neutilizate `DialogContent/DialogFooter/...`.

## Out of scope
- `OrderReviewModal.tsx` (1084 linii) — rămâne pentru un PR separat (deja notat anterior).
- modalele frontend (cart, auth, etc.) — neatinse.
