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
import { X, Sparkles, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Cache simplu in-memory per query → tastare/ștergere = instant, fără jitter
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
// SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
const HitSkeleton = memo(() => (
  <div className="flex flex-col gap-3 p-3 rounded-2xl w-full h-full">
    <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100/70 rounded-xl relative animate-pulse" />
    <div className="space-y-2 px-1 flex-1 flex flex-col">
      <div className="h-2 w-1/3 bg-zinc-100 rounded animate-pulse" />
      <div className="h-3 w-3/4 bg-zinc-200/70 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-zinc-200/70 rounded animate-pulse" />
      <div className="mt-auto h-4 w-1/2 bg-zinc-100 rounded animate-pulse" />
    </div>
  </div>
));
HitSkeleton.displayName = "HitSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// HIT CARD
// ─────────────────────────────────────────────────────────────────────────────
const HitCard = memo(
  ({ hit, onClick }: { hit: any; onClick: (slug: string) => void }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

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

    return (
      <button
        onClick={() => onClick(hit.slug)}
        className="group flex flex-col gap-3 p-3 hover:bg-[var(--lavender-purple)]/10 transition-colors duration-200 rounded-2xl text-left w-full h-full will-change-transform"
      >
        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-50 rounded-xl relative border border-[var(--royal-violet)]/5 transform-gpu">
          <img
            src={parsedImage}
            alt={hit.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 transform-gpu group-hover:scale-[1.04] ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x800?text=Fara+Imagine";
              setImgLoaded(true);
            }}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
          )}

          {hit.sale_price < hit.original_price && (
            <div
              className="absolute top-2 left-2 text-white text-[8px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-lg"
              style={{ background: "var(--primary-gradient)" }}
            >
              Ofertă
            </div>
          )}
        </div>
        <div className="space-y-1.5 px-1 flex-1 flex flex-col">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--royal-violet)]/60 font-bold line-clamp-1">
            {hit.brand || "Colecție Nouă"}
          </p>
          <h4 className="text-[12px] font-semibold tracking-tight text-[var(--dark-amethyst)] leading-snug line-clamp-2 flex-1">
            {hit.name}
          </h4>
          <p className="text-[13px] font-black text-[var(--dark-amethyst)] pt-1">
            {hit.price ? `${Number(hit.price).toLocaleString()} RON` : "---"}
          </p>
        </div>
      </button>
    );
  },
);
HitCard.displayName = "HitCard";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTA PRINCIPALĂ
// ─────────────────────────────────────────────────────────────────────────────
const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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

    // hit din cache → randare instant, fără spinner
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

  // Block body scroll while open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex flex-col transform-gpu"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,251,254,0.98) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* orbe decorative */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-3xl"
            style={{ background: "var(--mauve-magic)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl"
            style={{ background: "var(--lavender-purple)" }}
          />

          {/* HEADER */}
          <div className="relative flex items-center justify-between px-6 lg:px-16 py-7 border-b border-[var(--royal-violet)]/8 shrink-0">
            <div className="flex items-center gap-3">
              <Sparkles
                size={13}
                className="text-[var(--royal-violet)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-[0.45em] text-[var(--royal-violet)]/70">
                Căutare inteligentă
              </span>
            </div>
            <button
              onClick={handleClose}
              className="group flex items-center gap-4 text-zinc-400 hover:text-[var(--dark-amethyst)] transition-colors"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">
                Închide
              </span>
              <div className="h-11 w-11 border border-[var(--royal-violet)]/15 rounded-full flex items-center justify-center group-hover:bg-[var(--dark-amethyst)] group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                <X size={16} strokeWidth={1.5} />
              </div>
            </button>
          </div>

          {/* CONTENT */}
          <div className="relative flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 pt-10 overflow-hidden">
            {isConfigValid ? (
              <div className="flex flex-col h-full w-full">
                {/* INPUT */}
                <div className="mb-6 relative shrink-0">
                  <div className="relative flex items-center w-full">
                    <Search
                      className="absolute left-0 text-[var(--royal-violet)]/40"
                      size={30}
                      strokeWidth={1.25}
                    />
                    <input
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Caută în catalogul EVEM..."
                      className="heading-serif w-full bg-transparent border-b-2 border-[var(--royal-violet)]/10 py-5 pl-14 pr-14 text-3xl lg:text-5xl italic outline-none focus:border-[var(--royal-violet)] transition-colors placeholder:text-zinc-300 text-[var(--dark-amethyst)]"
                    />

                    <div className="absolute right-2 flex items-center gap-2">
                      <AnimatePresence>
                        {isCurrentlySearching && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Loader2
                              size={22}
                              className="text-[var(--royal-violet)] animate-spin"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {inputValue && !isCurrentlySearching && (
                        <button
                          onClick={() => setInputValue("")}
                          className="text-zinc-300 hover:text-[var(--dark-amethyst)] p-2 transition-colors"
                          aria-label="Șterge"
                        >
                          <X size={22} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Linie progres subțire în loc de tag-uri */}
                  <div className="mt-4 h-[1px] w-full overflow-hidden rounded-full bg-[var(--royal-violet)]/5">
                    <AnimatePresence>
                      {isCurrentlySearching && (
                        <motion.div
                          key="bar"
                          className="h-full w-1/3"
                          style={{ background: "var(--primary-gradient)" }}
                          initial={{ x: "-100%" }}
                          animate={{ x: "300%" }}
                          exit={{ opacity: 0 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* REZULTATE */}
                <div className="flex-1 overflow-y-auto pb-32 luxury-scrollbar relative w-full transform-gpu">
                  {isCurrentlySearching && !initialSearchDone ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                      {[...Array(12)].map((_, i) => (
                        <HitSkeleton key={`skel-${i}`} />
                      ))}
                    </div>
                  ) : hits.length > 0 ? (
                    <div
                      className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 transition-opacity duration-150 ${
                        isCurrentlySearching ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      {hits.map((hit) => (
                        <HitCard
                          key={hit.id}
                          hit={hit}
                          onClick={handleHitClick}
                        />
                      ))}
                    </div>
                  ) : initialSearchDone && !isCurrentlySearching ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center justify-start pt-24 text-center"
                    >
                      <div
                        className="size-20 rounded-full flex items-center justify-center mb-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(123,44,191,0.08), rgba(224,170,255,0.12))",
                        }}
                      >
                        <Search
                          size={32}
                          strokeWidth={1}
                          className="text-[var(--royal-violet)]/50"
                        />
                      </div>
                      <h3 className="heading-serif text-3xl italic text-[var(--dark-amethyst)] mb-2">
                        Niciun rezultat
                      </h3>
                      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.3em]">
                        Nimic pentru „
                        <span className="text-[var(--royal-violet)]">
                          {searchQuery}
                        </span>
                        ”
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-[0.5em] text-red-400 text-center px-4">
                Sincronizare eșuată. Verificați VITE_MEILI_URL și
                VITE_MEILI_SEARCH_KEY.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
