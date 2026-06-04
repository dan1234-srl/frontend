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
// VARIANTS PENTRU ANIMAȚII (FRAMER MOTION)
// ─────────────────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CACHE (Neschimbat - menținut pentru performanță)
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
// SKELETON CARD (Îmbunătățit vizual)
// ─────────────────────────────────────────────────────────────────────────────
const HitSkeleton = memo(() => (
  <motion.div
    variants={itemVariants}
    className="flex flex-col gap-3 p-3 rounded-2xl w-full h-full border border-transparent"
  >
    <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-xl relative">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
    </div>
    <div className="space-y-2.5 px-1 flex-1 flex flex-col">
      <div className="h-2 w-1/3 bg-zinc-100 rounded-full animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-3 w-5/6 bg-zinc-200/60 rounded-full animate-pulse" />
        <div className="h-3 w-4/6 bg-zinc-200/60 rounded-full animate-pulse" />
      </div>
      <div className="mt-auto h-4 w-1/2 bg-zinc-100 rounded-full animate-pulse" />
    </div>
  </motion.div>
));
HitSkeleton.displayName = "HitSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// HIT CARD (Animații noi și hover states premium)
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
      <motion.button
        variants={itemVariants}
        onClick={() => onClick(hit.slug)}
        className="group flex flex-col gap-3 p-3 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[var(--royal-violet)]/10 border border-transparent transition-all duration-300 rounded-2xl text-left w-full h-full will-change-transform"
      >
        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-50 rounded-xl relative shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] transform-gpu">
          <img
            src={parsedImage}
            alt={hit.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out transform-gpu group-hover:scale-[1.08] ${
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

          {/* Ofertă Overlay Gradient fin */}
          {hit.sale_price < hit.original_price && (
            <div
              className="absolute top-2 left-2 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-lg backdrop-blur-md"
              style={{ background: "var(--primary-gradient)" }}
            >
              Ofertă
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-1 flex-1 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--royal-violet)]/60 font-bold line-clamp-1">
            {hit.brand || "Colecție Nouă"}
          </p>
          <h4 className="text-[13px] font-semibold tracking-tight text-[var(--dark-amethyst)] leading-snug line-clamp-2 flex-1 group-hover:text-[var(--royal-violet)] transition-colors duration-200">
            {hit.name}
          </h4>
          <p className="text-[14px] font-black text-[var(--dark-amethyst)] pt-2 relative inline-flex w-fit">
            {hit.price ? `${Number(hit.price).toLocaleString()} RON` : "---"}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--primary-gradient)] transition-all duration-300 group-hover:w-full rounded-full opacity-50" />
          </p>
        </div>
      </motion.button>
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

  // Block body scroll
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
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] flex flex-col transform-gpu"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(252,251,254,0.98) 100%)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* ORBE DECORATIVE ANIMATE */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.06, 0.1, 0.06],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{ background: "var(--mauve-magic)" }}
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{ background: "var(--lavender-purple)" }}
          />

          {/* HEADER */}
          <div className="relative flex items-center justify-between px-6 lg:px-16 py-7 border-b border-[var(--royal-violet)]/5 shrink-0 bg-white/30">
            <div className="flex items-center gap-3 bg-[var(--royal-violet)]/5 px-4 py-2 rounded-full border border-[var(--royal-violet)]/10">
              <Sparkles
                size={14}
                className="text-[var(--royal-violet)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-[0.45em] text-[var(--dark-amethyst)]/80">
                Căutare inteligentă
              </span>
            </div>
            <button
              onClick={handleClose}
              className="group flex items-center gap-4 text-zinc-400 hover:text-[var(--dark-amethyst)] transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Închide
              </span>
              <div className="h-12 w-12 bg-white/50 border border-[var(--royal-violet)]/15 rounded-full flex items-center justify-center group-hover:bg-[var(--dark-amethyst)] group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm hover:rotate-90 hover:scale-105">
                <X size={18} strokeWidth={1.5} />
              </div>
            </button>
          </div>

          {/* CONTENT */}
          <div className="relative flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 pt-10 overflow-hidden">
            {isConfigValid ? (
              <div className="flex flex-col h-full w-full">
                {/* INPUT */}
                <div className="mb-8 relative shrink-0 group">
                  <div className="relative flex items-center w-full">
                    <Search
                      className={`absolute left-0 transition-colors duration-300 ${
                        inputValue
                          ? "text-[var(--royal-violet)]"
                          : "text-[var(--royal-violet)]/30 group-focus-within:text-[var(--royal-violet)]/60"
                      }`}
                      size={32}
                      strokeWidth={1.25}
                    />
                    <input
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Caută în catalogul EVEM..."
                      className="heading-serif w-full bg-transparent border-b-2 border-[var(--royal-violet)]/10 py-5 pl-14 pr-14 text-4xl lg:text-5xl italic outline-none focus:border-transparent transition-colors placeholder:text-zinc-300/80 text-[var(--dark-amethyst)]"
                    />

                    {/* Linia de border animată la focus */}
                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary-gradient)] transition-all duration-500 group-focus-within:w-full opacity-70" />

                    <div className="absolute right-2 flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {isCurrentlySearching ? (
                          <motion.div
                            key="loader"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Loader2
                              size={24}
                              className="text-[var(--royal-violet)] animate-spin"
                            />
                          </motion.div>
                        ) : inputValue ? (
                          <motion.button
                            key="clear"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            onClick={() => setInputValue("")}
                            className="bg-zinc-100 hover:bg-[var(--royal-violet)]/10 text-zinc-400 hover:text-[var(--royal-violet)] p-2 rounded-full transition-colors"
                            aria-label="Șterge"
                          >
                            <X size={18} strokeWidth={2} />
                          </motion.button>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Linie progres globală */}
                  <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-[var(--royal-violet)]/5">
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
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* REZULTATE */}
                <div className="flex-1 overflow-y-auto pb-32 luxury-scrollbar relative w-full transform-gpu px-2 -mx-2">
                  {isCurrentlySearching && !initialSearchDone ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10"
                    >
                      {[...Array(12)].map((_, i) => (
                        <HitSkeleton key={`skel-${i}`} />
                      ))}
                    </motion.div>
                  ) : hits.length > 0 ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 transition-opacity duration-300 ${
                        isCurrentlySearching
                          ? "opacity-40 grayscale-[20%]"
                          : "opacity-100"
                      }`}
                    >
                      {hits.map((hit) => (
                        <HitCard
                          key={hit.id}
                          hit={hit}
                          onClick={handleHitClick}
                        />
                      ))}
                    </motion.div>
                  ) : initialSearchDone && !isCurrentlySearching ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col items-center justify-start pt-32 text-center"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="size-24 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl border border-white"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(123,44,191,0.05), rgba(224,170,255,0.15))",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <Search
                          size={36}
                          strokeWidth={1}
                          className="text-[var(--royal-violet)]/60 -rotate-3"
                        />
                      </motion.div>
                      <h3 className="heading-serif text-4xl italic text-[var(--dark-amethyst)] mb-3">
                        Niciun rezultat
                      </h3>
                      <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-[0.25em]">
                        Nu am găsit produse pentru „
                        <span className="text-[var(--royal-violet)] font-bold">
                          {searchQuery}
                        </span>
                        ”
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="p-4 bg-red-50 text-red-400 rounded-full">
                  <X size={24} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-red-400 font-bold max-w-md leading-relaxed">
                  Conexiune invalidă.
                  <br />
                  Verificați variabilele de mediu MeiliSearch.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
