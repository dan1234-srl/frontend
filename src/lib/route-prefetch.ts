/**
 * Route-chunk prefetcher.
 *
 * Pentru fiecare rută lazy din App.tsx avem aici un import() identic.
 * Vite dedupe-uiește chunk-ul, deci chemarea aici doar îl descarcă și-l
 * pune în cache HTTP — când userul navighează, modulul e deja gata,
 * fără spinner / paint blocking.
 *
 * Strategia: `prefetchCriticalRoutes()` rulează la idle după mount și
 * încarcă paginile cu probabilitate mare de navigare (Category, Product).
 * `prefetchRoute(name)` poate fi apelat pe hover/focus pe linkuri.
 */

const importers = {
  index: () => import("@/pages/Index"),
  category: () => import("@/pages/CategoryPage"),
  product: () => import("@/pages/ProductDetail"),
  notFound: () => import("@/pages/NotFound"),

  // Account
  account: () => import("@/pages/main/Account"),
  orders: () => import("@/pages/main/Orders"),
  addresses: () => import("@/pages/main/Addresses"),

  // Auth
  resetPassword: () => import("@/pages/auth/ResetPassword"),

  // About / legal
  ourStory: () => import("@/pages/about/OurStory"),
  sustainability: () => import("@/pages/about/Sustainability"),
  sizeGuide: () => import("@/pages/about/SizeGuide"),
  customerCare: () => import("@/pages/about/CustomerCare"),
  storeLocator: () => import("@/pages/about/StoreLocator"),
  privacyPolicy: () => import("@/pages/PrivacyPolicy"),
  termsOfService: () => import("@/pages/TermsOfService"),
  returnPolicy: () => import("@/pages/ReturnPolicy"),
  cookiePolicy: () => import("@/pages/CookiePolicy"),

  // Stripe
  stripeSuccess: () => import("@/pages/stripe/SuccessPage"),
  stripeCancel: () => import("@/pages/stripe/CancelPage"),
} as const;

export type RouteName = keyof typeof importers;

const inflight = new Set<RouteName>();

export function prefetchRoute(name: RouteName) {
  if (inflight.has(name)) return;
  inflight.add(name);
  importers[name]().catch(() => {
    // dacă a eșuat (rețea), permitem retry data viitoare
    inflight.delete(name);
  });
}

type IdleCb = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void;
const ric: (cb: IdleCb, opts?: { timeout: number }) => number =
  (typeof window !== "undefined" && (window as any).requestIdleCallback) ||
  ((cb: IdleCb) =>
    window.setTimeout(
      () => cb({ didTimeout: false, timeRemaining: () => 50 }),
      1,
    ));

/**
 * Pornește prefetch-ul în fundal, escalonat, fără să concureze cu LCP.
 * Prima rută merge după ~1.2s; restul la idle, una câte una.
 */
export function prefetchCriticalRoutes() {
  if (typeof window === "undefined") return;

  // Respectă preferința userului pentru date reduse
  const conn = (navigator as any).connection;
  if (conn?.saveData) return;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

  // Priorități: ce vede userul de obicei după landing
  const order: RouteName[] = [
    "category",
    "product",
    "account",
    "ourStory",
    "customerCare",
    "sizeGuide",
    "storeLocator",
    "sustainability",
    "orders",
    "addresses",
    "resetPassword",
    "privacyPolicy",
    "termsOfService",
    "returnPolicy",
    "cookiePolicy",
    "stripeSuccess",
    "stripeCancel",
    "notFound",
  ];

  let i = 0;
  const step = () => {
    if (i >= order.length) return;
    prefetchRoute(order[i++]);
    ric(step, { timeout: 2000 });
  };

  // Așteptăm puțin după mount ca să nu furăm bandă din LCP
  window.setTimeout(() => ric(step, { timeout: 2000 }), 1200);
}

/**
 * Helper pentru linkuri: <Link onMouseEnter={() => prefetchOnHover("product")} />
 */
export const prefetchOnHover = prefetchRoute;
