import {
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
  useTransition,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag as BagIcon,
  LogOut,
  ShieldCheck,
  Heart,
  Package,
  Sparkles,
  Search,
  MapPin,
  Settings,
  X,
  Loader2,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useFilters } from "@/contexts/FiltersContext";
import ShoppingBag from "../cart/ShoppingBag";
import WishlistDrawer from "../cart/WishlistDrawer";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { toast } from "sonner";
import ForgotPasswordDrawer from "@/pages/auth/ForgotPasswordDrawer";
import { FilterSidebar } from "../shop/FilterSidebar";

// ─────────────────────────────────────────────────────────────────────────────
// Cache simplu in-memory per query
// ─────────────────────────────────────────────────────────────────────────────
const queryCache = new Map<string, any[]>();
const QUERY_CACHE_LIMIT = 50;
const cachePut = (q: string, hits: any[]) => {
  if (queryCache.size >= QUERY_CACHE_LIMIT) {
    const firstKey = queryCache.keys().next().value;
    if (firstKey !== undefined) queryCache.delete(firstKey);
  }
  queryCache.set(q, hits);
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON ROW
// ─────────────────────────────────────────────────────────────────────────────
const RowSkeleton = memo(({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.04 }}
    className="flex items-center gap-4 px-5 py-3.5"
  >
    <div className="text-[9px] font-black text-zinc-100 w-5 text-right tabular-nums shrink-0">
      {String(index + 1).padStart(2, "0")}
    </div>
    <div className="w-12 h-12 rounded-xl bg-zinc-100 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-1.5 w-14 bg-zinc-100 rounded-full animate-pulse" />
      <div className="h-3 w-40 bg-zinc-200/70 rounded-full animate-pulse" />
    </div>
    <div className="h-3 w-20 bg-zinc-100 rounded-full animate-pulse shrink-0" />
  </motion.div>
));
RowSkeleton.displayName = "RowSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// HIT ROW
// ─────────────────────────────────────────────────────────────────────────────
const HitRow = memo(
  ({
    hit,
    onClick,
    index,
  }: {
    hit: any;
    onClick: (slug: string) => void;
    index: number;
  }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [hovered, setHovered] = useState(false);

    const parsedImage = useMemo(() => {
      if (!hit.image_url) return hit.image || "";
      if (typeof hit.image_url === "string" && hit.image_url.startsWith("http"))
        return hit.image_url;
      try {
        const parsed = JSON.parse(hit.image_url);
        return (
          parsed?.main?.medium ||
          parsed?.main?.large ||
          parsed?.main?.small ||
          ""
        );
      } catch {
        return hit.image || "";
      }
    }, [hit.image_url, hit.image]);

    const isOnSale =
      hit.sale_price &&
      hit.original_price &&
      hit.sale_price < hit.original_price;

    return (
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.028,
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={() => onClick(hit.slug)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-full flex items-center gap-4 px-5 py-3 text-left group focus:outline-none"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="hfill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute inset-x-2 inset-y-0.5 rounded-2xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 5.5%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 3.5%, transparent) 100%)",
              }}
            />
          )}
        </AnimatePresence>

        <span
          className="relative text-[9px] font-black tabular-nums w-5 text-right shrink-0 transition-colors duration-150"
          style={{
            color: hovered
              ? "var(--royal-violet)"
              : "color-mix(in srgb, var(--royal-violet) 18%, transparent)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-zinc-50 border border-black/[0.04]">
          <img
            src={parsedImage}
            alt={hit.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/200x200?text=?";
              setImgLoaded(true);
            }}
            className="w-full h-full object-cover transition-all duration-500 will-change-transform"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transform: hovered ? "scale(1.12)" : "scale(1)",
            }}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
          )}

          {isOnSale && (
            <div
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full shadow-sm"
              style={{ background: "var(--primary-gradient)" }}
            />
          )}
        </div>

        <div className="relative flex-1 min-w-0">
          <p
            className="text-[8.5px] uppercase tracking-[0.32em] font-bold mb-0.5 truncate transition-colors duration-150"
            style={{
              color: hovered
                ? "var(--royal-violet)"
                : "color-mix(in srgb, var(--royal-violet) 38%, transparent)",
            }}
          >
            {hit.brand || "Colecție Nouă"}
          </p>
          <h4
            className="text-[12.5px] font-semibold leading-tight tracking-tight truncate transition-colors duration-150"
            style={{ color: "var(--dark-amethyst)" }}
          >
            {hit.name}
          </h4>
        </div>

        <div className="relative flex items-center gap-2.5 shrink-0">
          <div className="text-right">
            {isOnSale && (
              <p className="text-[9px] line-through font-medium text-zinc-300 leading-none mb-0.5">
                {Number(hit.original_price).toLocaleString()} RON
              </p>
            )}
            <p
              className="text-[12.5px] font-black leading-none transition-colors duration-150"
              style={{ color: "var(--dark-amethyst)" }}
            >
              {hit.price ? `${Number(hit.price).toLocaleString()} RON` : "—"}
            </p>
          </div>

          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -5 }}
            transition={{ duration: 0.15 }}
            className="shrink-0"
          >
            <ArrowUpRight
              size={13}
              strokeWidth={2}
              style={{ color: "var(--royal-violet)" }}
            />
          </motion.div>
        </div>
      </motion.button>
    );
  },
);
HitRow.displayName = "HitRow";

const Sep = () => (
  <div
    className="mx-5 h-px"
    style={{
      background: "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH MODAL (Aliniat perfect în Navbar)
// ─────────────────────────────────────────────────────────────────────────────
const SearchModal = ({
  isOpen,
  onClose,
  isScrolled = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isScrolled?: boolean;
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const meiliUrl = import.meta.env.VITE_MEILI_URL;
  const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

  const isConfigValid = useMemo(
    () => !!(meiliUrl && meiliUrl.startsWith("http") && meiliKey),
    [meiliUrl, meiliKey],
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setSearchQuery(inputValue), 220);
    return () => clearTimeout(timer);
  }, [inputValue, isOpen]);

  useEffect(() => {
    if (!isConfigValid || !isOpen) return;
    const q = searchQuery.trim();

    if (queryCache.has(q)) {
      startTransition(() => {
        setHits(queryCache.get(q) || []);
        setInitialSearchDone(true);
      });
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const performSearch = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`${meiliUrl}/indexes/products/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${meiliKey}`,
          },
          body: JSON.stringify({ q, limit: 18 }),
          signal: ctrl.signal,
        });
        const data = await response.json();
        const newHits = data.hits || [];
        cachePut(q, newHits);
        startTransition(() => {
          setHits(newHits);
          setInitialSearchDone(true);
        });
      } catch (error: any) {
        if (error?.name !== "AbortError")
          console.error("Eroare MeiliSearch:", error);
      } finally {
        if (!ctrl.signal.aborted) setIsFetching(false);
      }
    };

    performSearch();
    return () => ctrl.abort();
  }, [searchQuery, meiliUrl, meiliKey, isConfigValid, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    setInputValue("");
    setSearchQuery("");
    setHits([]);
    setInitialSearchDone(false);
    onClose();
  }, [onClose]);

  const handleHitClick = useCallback(
    (slug: string) => {
      navigate(`/product/${slug}`);
      handleClose();
    },
    [navigate, handleClose],
  );

  const isCurrentlySearching =
    isFetching || isPending || inputValue !== searchQuery;

  const showEmptyState =
    initialSearchDone && !isCurrentlySearching && hits.length === 0;
  const showInitialState = !initialSearchDone && !isCurrentlySearching;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop cu blur pe tot ecranul */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[190] bg-zinc-900/10 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
          />

          {/* Panel — "contopit" cu Navbar: la top arată ca o continuare directă,
              la scroll devine o capsulă atașată sub pill-ul flotant */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-[200] left-0 flex flex-col transform-gpu bg-white/95 backdrop-blur-3xl border border-zinc-100/80 overflow-hidden pointer-events-auto w-[calc(100vw-2rem)] sm:w-[28rem] origin-top-left ${
              isScrolled
                ? "top-[calc(100%+0.625rem)] rounded-[1.75rem] shadow-[0_30px_70px_-20px_rgba(123,44,191,0.22)]"
                : "top-[calc(100%+0.5rem)] rounded-t-[0.5rem] rounded-b-[1.75rem] shadow-[0_30px_70px_-20px_rgba(123,44,191,0.18)] border-t-0"
            }`}
            style={{
              maxHeight: "min(75vh, calc(100vh - 8rem))",
            }}
          >

            {/* Cap gradient decorativ */}
            <div
              className="h-1 w-full shrink-0"
              style={{ background: "var(--primary-gradient)" }}
            />

            {/* Input & Search state */}
            <div className="px-5 pt-4 pb-3 shrink-0 border-b border-zinc-100/60">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-5 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isCurrentlySearching ? (
                      <motion.div
                        key="spin"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Loader2
                          size={17}
                          strokeWidth={2}
                          className="animate-spin"
                          style={{ color: "var(--royal-violet)" }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Search
                          size={17}
                          strokeWidth={1.6}
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Căutare inteligentă EVEM…"
                  className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:font-normal"
                  style={{ color: "var(--dark-amethyst)" }}
                />

                <AnimatePresence>
                  {inputValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setInputValue("")}
                      className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress bar animat */}
              <div
                className="mt-3 h-px w-full overflow-hidden rounded-full"
                style={{
                  background:
                    "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                }}
              >
                <AnimatePresence>
                  {isCurrentlySearching && (
                    <motion.div
                      className="h-full w-1/3"
                      style={{ background: "var(--primary-gradient)" }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "340%" }}
                      exit={{ opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.1,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Rezultate */}
            <div className="overflow-y-auto flex-1 luxury-scrollbar">
              {!isConfigValid ? (
                <div className="py-10 text-center text-[10px] uppercase tracking-[0.45em] text-red-400 px-6">
                  Eroare Sincronizare. (VITE_MEILI_URL/KEY lipsă)
                </div>
              ) : isCurrentlySearching && !initialSearchDone ? (
                <div className="py-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={`sk-${i}`}>
                      <RowSkeleton index={i} />
                      {i < 5 && <Sep />}
                    </div>
                  ))}
                </div>
              ) : hits.length > 0 ? (
                <div
                  className="py-2 transition-opacity duration-150"
                  style={{ opacity: isCurrentlySearching ? 0.4 : 1 }}
                >
                  <div className="px-5 pt-1 pb-2.5 flex items-center justify-between">
                    <span
                      className="text-[8.5px] uppercase tracking-[0.38em] font-black"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                      }}
                    >
                      {hits.length} rezultate
                    </span>
                  </div>
                  {hits.map((hit, i) => (
                    <div key={hit.id}>
                      <HitRow hit={hit} onClick={handleHitClick} index={i} />
                      {i < hits.length - 1 && <Sep />}
                    </div>
                  ))}
                </div>
              ) : showEmptyState ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 flex flex-col items-center text-center px-8"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                    }}
                  >
                    <Search
                      size={20}
                      strokeWidth={1.2}
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                      }}
                    />
                  </div>
                  <p
                    className="text-[13px] font-bold mb-1"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    Niciun rezultat
                  </p>
                  <p
                    className="text-[10px] font-medium"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 38%, transparent)",
                    }}
                  >
                    Nu am găsit produse pentru „{searchQuery}”
                  </p>
                </motion.div>
              ) : showInitialState ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 flex flex-col items-center text-center px-8"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner"
                    style={{
                      background:
                        "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                    }}
                  >
                    <Sparkles
                      size={20}
                      strokeWidth={1.4}
                      style={{ color: "var(--royal-violet)" }}
                    />
                  </div>
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    Începe să tastezi
                  </p>
                  <p
                    className="text-[10px] font-medium mt-1 uppercase tracking-widest"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                    }}
                  >
                    Produse • Colecții • Branduri
                  </p>
                </motion.div>
              ) : null}
            </div>

            {/* Footer Modal */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-3 border-t bg-zinc-50/50"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles
                  size={9}
                  className="animate-pulse"
                  style={{ color: "var(--royal-violet)" }}
                />
                <span
                  className="text-[8px] uppercase tracking-[0.45em] font-black"
                  style={{
                    color:
                      "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                  }}
                >
                  Motor de căutare avansat
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-500 font-mono text-[8px] shadow-sm">
                    ↵
                  </kbd>
                  selectează
                </span>
                <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-500 font-mono text-[8px] shadow-sm">
                    esc
                  </kbd>
                  închide
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────
   FILTER DRAWER
───────────────────────────────────────────────────────────── */
// Codul pentru FilterDrawer rămâne exact același (cel cu efectul de sticlă din răspunsul meu precedent)

/* ─────────────────────────────────────────────────────────────
   NAVBAR PRINCIPAL (Floating Pill Concept Redefined)
───────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Pentru Promo Bar și Floating Effect
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const openCart = () => setBagOpen(true);
    window.addEventListener("evem:open-cart", openCart);
    return () => window.removeEventListener("evem:open-cart", openCart);
  }, []);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Detectare scroll pentru plierea benzii de promo
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 30);
  });

  // --- MATEMATICA FLUIDĂ PENTRU FLOATING PILL ---
  // Aici garantăm că la scroll 0 are lățime 100%, iar apoi devine o capsulă
  const navWidth = useTransform(
    scrollY,
    [0, 60],
    ["100%", "calc(100% - 2rem)"],
  );
  const navMaxWidth = useTransform(scrollY, [0, 60], ["100%", "1200px"]);
  const navMarginTop = useTransform(scrollY, [0, 60], ["0px", "16px"]);
  const navBorderRadius = useTransform(scrollY, [0, 60], ["0px", "100px"]);
  const navPadding = useTransform(scrollY, [0, 60], ["22px 56px", "8px 24px"]);
  const navGap = useTransform(scrollY, [0, 60], ["48px", "16px"]);

  // Efectele de sticlă
  const navBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.85)"],
  );
  const navBorder = useTransform(
    scrollY,
    [0, 60],
    ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.7)"],
  );
  const navShadow = useTransform(
    scrollY,
    [0, 60],
    [
      "0 1px 0px 0 rgba(0,0,0,0.04)",
      "0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(123,44,191,0.03)",
    ],
  );
  const navBackdrop = useTransform(
    scrollY,
    [0, 60],
    ["blur(0px)", "blur(24px)"],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesiune încheiată cu succes.");
    setUserMenuOpen(false);
    navigate("/");
  };

  // Butoane iconițe ultra-curate (fără background gri fix)
  const navButtonClass =
    "relative flex items-center justify-center size-10 rounded-full text-zinc-500 transition-colors duration-300 hover:text-[var(--royal-violet)] before:absolute before:inset-0 before:rounded-full before:bg-[var(--royal-violet)] before:opacity-0 hover:before:opacity-10 before:scale-50 hover:before:scale-100 before:transition-all before:duration-300 before:ease-out";

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col items-center w-full pointer-events-none">
        {/* ── TOP BAR PROMO (Animated Dark Premium) ── */}
        <motion.div
          animate={{
            height: isScrolled ? 0 : 36,
            opacity: isScrolled ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full flex items-center justify-center overflow-hidden pointer-events-auto relative bg-[#0a0510]"
        >
          {/* Raza animată din fundal pentru efect de lux */}
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--royal-violet) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
          />
          <div className="flex items-center gap-2.5 relative z-10">
            <Sparkles size={11} className="text-[#E0D4F5] animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-md">
              Standardul Evem <span className="opacity-40 mx-2">•</span>{" "}
              Eleganță & Performanță
            </p>
          </div>
        </motion.div>

        {/* ── NAV CONTAINER (The Floating Pill) ── */}
        <motion.nav
          style={{
            width: navWidth,
            maxWidth: navMaxWidth,
            marginTop: navMarginTop,
            borderRadius: navBorderRadius,
            backgroundColor: navBg,
            boxShadow: navShadow,
            border: navBorder,
            backdropFilter: navBackdrop,
            padding: navPadding,
            gap: navGap,
          }}
          className="relative flex items-center justify-between pointer-events-auto transform-gpu transition-all"
        >
          {/* LEFT — SEARCH (Aici integrăm modalul absolut!) */}
          <div className="flex flex-1 items-center justify-start relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              aria-label="Caută"
              aria-hidden={searchOpen}
              tabIndex={searchOpen ? -1 : 0}
              animate={{
                opacity: searchOpen ? 0 : 1,
                scale: searchOpen ? 0.85 : 1,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ pointerEvents: searchOpen ? "none" : "auto" }}
              className={navButtonClass}
            >
              <Search size={18} strokeWidth={2} className="relative z-10" />
            </motion.button>

            {/* Inserăm SearchModal aici pentru aliniere matematică */}
            <SearchModal
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              isScrolled={isScrolled}
            />
          </div>

          {/* CENTER — LOGO */}
          <div className="flex-shrink-0 flex items-center justify-center px-4">
            <Link to="/" className="group relative">
              <motion.img
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                src="/Copilot_20260512_191942.png"
                alt="Evem Luxury"
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain transition-all drop-shadow-sm"
              />
            </Link>
          </div>

          {/* RIGHT — ACTIONS */}
          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1.5">
            {/* Wishlist */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setWishOpen(true)}
              aria-label="Lista de dorințe"
              className={navButtonClass}
            >
              <Heart size={18} strokeWidth={2} className="relative z-10" />
            </motion.button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                aria-label="Contul meu"
                className={`${navButtonClass} ${
                  userMenuOpen
                    ? "text-[var(--royal-violet)] before:scale-100 before:opacity-10"
                    : ""
                }`}
              >
                <User size={18} strokeWidth={2} className="relative z-10" />
              </motion.button>

              {/* Dropdown Menu (Glassmorphism Bento) */}
              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 15,
                      scale: 0.96,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.96,
                      filter: "blur(8px)",
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="absolute right-0 sm:right-[-10px] mt-4 w-[280px] sm:w-[320px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(123,44,191,0.15)] p-2 z-50 origin-top-right"
                  >
                    <div className="bg-zinc-50/80 p-5 rounded-[1.25rem] mb-2 border border-zinc-100">
                      <p className="text-[8px] font-black uppercase text-[var(--royal-violet)] tracking-[0.3em] mb-1">
                        Conectat ca
                      </p>
                      <p className="truncate text-sm font-bold text-[var(--dark-amethyst)]">
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-0.5 p-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[var(--royal-violet)] transition-all"
                        >
                          <span className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-blue-500" />
                            Administrare
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                      )}
                      <Link
                        to="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[var(--royal-violet)] transition-all"
                      >
                        <span className="flex items-center gap-3">
                          <Package
                            size={16}
                            className="text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors"
                          />
                          Comenzile mele
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                        />
                      </Link>
                      <Link
                        to="/account/addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[var(--royal-violet)] transition-all"
                      >
                        <span className="flex items-center gap-3">
                          <MapPin
                            size={16}
                            className="text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors"
                          />
                          Adresele mele
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                        />
                      </Link>
                      <Link
                        to="/account/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[var(--royal-violet)] transition-all"
                      >
                        <span className="flex items-center gap-3">
                          <Settings
                            size={16}
                            className="text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors"
                          />
                          Setări cont
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                        />
                      </Link>
                    </div>

                    <div className="h-px bg-zinc-100 my-1 mx-3" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all active:scale-95 mt-1"
                    >
                      <LogOut size={14} strokeWidth={2.5} /> Ieșire din cont
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Button (Solid Luxury CTA) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBagOpen(true)}
              aria-label="Coș de cumpărături"
              className="relative flex size-10 sm:size-11 items-center justify-center rounded-full ml-1 md:ml-2 text-white shadow-[0_8px_20px_-5px_rgba(123,44,191,0.4)] transition-colors hover:brightness-110"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={18} strokeWidth={2} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full border-[2px] border-white bg-zinc-900 text-[9px] font-black shadow-sm"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </header>

      {/* ── MODALS & OVERLAYS ── */}
      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />

      {/* FILTER DRAWER */}

      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setTimeout(() => setRegisterOpen(true), 150);
        }}
        onOpenForgot={() => {
          setLoginOpen(false);
          setTimeout(() => setForgotOpen(true), 150);
        }}
      />
      <Register
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setTimeout(() => setLoginOpen(true), 150);
        }}
      />
      <ForgotPasswordDrawer
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);
          setTimeout(() => setLoginOpen(true), 150);
        }}
      />
    </>
  );
};

export default Navbar;
