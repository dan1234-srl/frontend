## AdminDialogShell — redesign premium

Obiectiv: să nu mai pară un simplu modal Radix. Vrem o "scenă" cu profunzime, intrare cinematică și o formă cu personalitate (asimetrică, cu accente vizuale Evem).

### 1. Formă & structură vizuală

**Desktop**
- Renunțăm la dreptunghiul `rounded-[2rem]` plat. Trecem la un container cu:
  - colț stânga-sus tăiat în unghi (clip-path) — semnătură vizuală Evem
  - bară verticală subțire `bg-[var(--royal-violet)]` la stânga (4px) cu eyebrow rotit 90°
  - "halo" gradient extern (un al doilea div absolut, blur 80px, opacitate 0.25, culoare violet/amethyst) care pulsează lent
- Header cu un `aurora` subtil (gradient animat în fundal, opacitate ~0.06)
- Footer cu o linie superioară din 1px gradient (în loc de `border-zinc-100` plat)
- Buton close ca pastilă cu micro-rotație la hover (45°), plasat *în afara* shell-ului (top-right -16/-16) — semnal premium tip Apple/Hermès

**Mobile (bottom-sheet)**
- Drag handle real: bară 36×4 cu hover/active feedback + reacție la swipe-down (drag-to-close)
- Top corners `rounded-t-[28px]` + un al doilea strat "lift" în spate (offset 6px, opacitate 40%) ca să dea senzație de carduri stivuite
- Safe-area + un mic indicator de scroll (linie gradient când conținutul depășește)

### 2. Animație de intrare (înlocuiește fade + slide-from-top-2)

Pe desktop, secvență coregrafiată (toate pe transform/opacity, GPU-only, ~320ms total):
1. **Overlay**: fade 180ms + `backdrop-blur` de la 0 → 8px (animat via `@property --blur`)
2. **Halo gradient**: scale 0.6 → 1, opacity 0 → 0.25, 280ms, ease-out
3. **Shell**: entry de tip "lift & settle"
   - `clip-path` se deschide din centru (inset 40% → 0) pe 260ms — efect "iris/curtain"
   - simultan `translateY(20px) scale(0.96) → 0/1` cu `cubic-bezier(0.22, 1, 0.36, 1)`
4. **Conținut intern** (header → body → footer): stagger 40ms fiecare, `translateY(8px) → 0`, opacity 0 → 1

Pe mobile: sheet face slide-up 240ms cu `cubic-bezier(0.34, 1.56, 0.64, 1)` (mic overshoot premium, NU bouncy gimicky), + drag-handle pulse o dată la apariție.

`prefers-reduced-motion`: degradare la fade simplu 150ms, fără clip-path/stagger.

### 3. Detalii "premium" suplimentare

- `box-shadow` în 3 straturi (umbră aproape + umbră difuză + glow violet 0.08) — nu un singur `shadow-2xl` generic
- Border `1px solid` cu gradient (mask trick) în loc de zinc-100
- Pe `data-[state=closed]`: closing reverse natural (shell se restrânge spre punctul de origin, NU doar fade-out)
- Suport `originRef` opțional: dacă pasăm referința butonului care a deschis dialog-ul, animația pornește din coordonatele acelui buton (efect "Apple Magic")

### 4. API păstrat compatibil

`AdminDialogShell` păstrează exact aceeași semnătură (`open`, `onOpenChange`, `size`, `mobileVariant`, `className`, `children`, `hideOverlay`). Adăugăm doar:
- `accentColor?: string` (default royal-violet)
- `originRef?: React.RefObject<HTMLElement>` (opțional, pentru magic-origin animation)

Toate cele 7 modale admin migrate anterior funcționează fără schimbări.

---

## Ce a mai rămas în AdminLayout

Recomandări concrete, în ordinea impactului:

1. **Sidebar pe desktop — colaps cu jitter**
   `width` animat prin `transition-all duration-300` pe `<aside>`. Modifică layout-ul → reflow pe fiecare frame. De înlocuit cu `transform: translateX` pe conținut + `width` fixă în 2 stări, sau cu `framer-motion` layout animation.

2. **Mobile sidebar — buton close suprapus**
   Butonul `X` e plasat absolute peste primul item din meniu. De mutat în header-ul sidebar-ului (lângă logo).

3. **`RouteProgress` — montat hard pe fiecare schimbare**
   Acum apare 650ms fix, indiferent dacă pagina e deja în cache (instant). De legat de `isValidating` din `useAdminSWR` → bara apare DOAR cât durează revalidarea reală. Altfel pare fake-loading.

4. **Tranziția slide între pagini — fără direcție semantică**
   Mereu intră de la dreapta (`x: 12 → 0`). Mai premium: direcție în funcție de ierarhia meniului (sus/jos sau stânga/dreapta în funcție de grupul activ). Sau simplu: doar opacity + 4px translate, fără direcție, ca să nu pară "swipe" aleator.

5. **Logo + eyebrow „Atelier Suite" — alinierea sare** la collapse
   Când `isSidebarOpen` devine `false`, eyebrow-ul dispare brusc. De adăugat `AnimatePresence` cu fade 150ms.

6. **Active item — doar background change**
   Lipsește un indicator vizual (bară verticală 2px stânga, `bg-[var(--royal-violet)]`) care să gliseze între iteme cu `layoutId` (framer-motion). Detaliu mic, impact mare pe percepție.

7. **Header mobile — gol în mijloc**
   Logo centrat + două butoane goale (`size-10` placeholder dreapta). De adăugat: buton notificări / quick-search / user avatar (deja avem `user` în context, neutilizat).

8. **`SidebarContent` memo + `useLocation` înăuntru**
   `useLocation` în interiorul componentei memoizate anulează parțial `memo`. De ridicat `location.pathname` în prop sau de eliminat `memo`.

9. **`menuGroups` recreat la fiecare render**
   Constă din obiecte noi → fiecare render trimite props noi la `SidebarContent`. De mutat în afara componentei sau în `useMemo`.

10. **Scrollbar — `luxury-scrollbar` doar în sidebar**
    Main content folosește scrollbar nativ. De aplicat aceeași clasă pe `<main>` pentru consistență.

11. **Footer „Ieșire Site" duce la `/`, nu face logout**
    Numele sugerează logout, dar doar navighează. De clarificat: fie redenumit "Înapoi la site", fie chemat `signOut()` din `AuthContext`.

---

## Tehnic — fișiere atinse

- `src/components/admin/AdminDialogShell.tsx` — rescris (clip-path, halo, stagger, origin animation)
- `src/index.css` — câteva keyframes noi (`@keyframes adminShellIn`, `@property --shell-clip`) și un utility `.admin-shell-halo`
- `src/pages/admin/AdminLayout.tsx` — punctele 1-11 de mai sus, dar într-un PR separat după ce confirmi prioritățile

## Verificare

- Build pass, no TS errors
- Vizual: deschis 1 modal pe fiecare din cele 7 pagini admin (desktop + mobile 375px)
- `prefers-reduced-motion: reduce` → fallback fade simplu
- Performanță: animația rulează pe compositor (DevTools → Performance, nu trebuie să apară layout/paint în frame-uri)
