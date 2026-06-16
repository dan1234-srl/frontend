import {
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
  useTransition,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Search, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Cache in-memory
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
// COMPONENTA PRINCIPALĂ
// ─────────────────────────────────────────────────────────────────────────────
const SearchModal = ({
  isOpen,
  onClose,
  isScrolled = false, // <-- AICI E FIX-UL (Prop nou primit din Navbar)
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

  // Debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setSearchQuery(inputValue), 220);
    return () => clearTimeout(timer);
  }, [inputValue, isOpen]);

  // Fetch + cache
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

  // Body scroll lock + ESC
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

          {/* Panel perfect aliniat (folosim isScrolled pt a ajusta înălțimea) */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-[200] left-0 mt-3 sm:mt-5 flex flex-col transform-gpu bg-white/95 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(123,44,191,0.2)] rounded-[1.5rem] border border-zinc-100 overflow-hidden pointer-events-auto w-[calc(100vw-2rem)] sm:w-[28rem] origin-top-left transition-all duration-400 ease-out ${
              isScrolled ? "top-[3.5rem]" : "top-[5.5rem]" // <-- ALINIERE DINAMICĂ AICI
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

export default SearchModal;
