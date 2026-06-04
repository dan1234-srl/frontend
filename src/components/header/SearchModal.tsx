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
// Cache simplu in-memory per query — neschimbat din original
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
        {/* Hover fill */}
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

        {/* Row number */}
        <span
          className="relative text-[9px] font-black tabular-nums w-5 text-right shrink-0 transition-colors duration-150"
          style={{
            color: hovered ? "var(--royal-violet)" : "color-mix(in srgb, var(--royal-violet) 18%, transparent)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Thumbnail */}
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

          {/* Sale dot */}
          {isOnSale && (
            <div
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full shadow-sm"
              style={{ background: "var(--primary-gradient)" }}
            />
          )}
        </div>

        {/* Text content */}
        <div className="relative flex-1 min-w-0">
          <p
            className="text-[8.5px] uppercase tracking-[0.32em] font-bold mb-0.5 truncate transition-colors duration-150"
            style={{
              color: hovered ? "var(--royal-violet)" : "color-mix(in srgb, var(--royal-violet) 38%, transparent)",
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

        {/* Price block */}
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

          {/* Arrow icon */}
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

// ─────────────────────────────────────────────────────────────────────────────
// SEPARATOR
// ─────────────────────────────────────────────────────────────────────────────
const Sep = () => (
  <div className="mx-5 h-px" style={{ background: "color-mix(in srgb, var(--royal-violet) 5%, transparent)" }} />
);

// ─────────────────────────────────────────────────────────────────────────────


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
  const inputRef = useRef<HTMLInputElement>(null);

  const meiliUrl = import.meta.env.VITE_MEILI_URL;
  const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

  const isConfigValid = useMemo(
    () => !!(meiliUrl && meiliUrl.startsWith("http") && meiliKey),
    [meiliUrl, meiliKey],
  );

  // ─── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setSearchQuery(inputValue), 220);
    return () => clearTimeout(timer);
  }, [inputValue, isOpen]);

  // ─── Fetch + cache ──────────────────────────────────────────────────────────
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

  // ─── Body scroll lock + ESC ─────────────────────────────────────────────────
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
          {/* ── Invisible click-catcher (no blur, no darken) ───────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[999] cursor-pointer bg-transparent"
            onClick={handleClose}
          />

          {/* ── Floating command palette panel ─────────────────────────── */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[1000] left-1/2 -translate-x-1/2 rounded-3xl overflow-hidden flex flex-col transform-gpu
              top-[5.25rem] w-[calc(100vw-1.25rem)] max-w-[34rem]
              sm:top-[6rem]
              lg:top-[7.25rem]"
            style={{
              background: "color-mix(in srgb, var(--background) 98%, white)",
              boxShadow:
                "0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent), 0 20px 60px color-mix(in srgb, var(--dark-amethyst) 22%, transparent), 0 4px 14px color-mix(in srgb, var(--dark-amethyst) 10%, transparent)",
              maxHeight: "min(78vh, calc(100vh - 7rem))",
            }}
          >


            {/* Gradient cap bar */}
            <div
              className="h-0.5 w-full shrink-0"
              style={{ background: "var(--primary-gradient)" }}
            />

            {/* ── Search input ───────────────────────────────────────────── */}
            <div className="px-5 pt-4 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                {/* Icon / spinner */}
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
                          style={{ color: "color-mix(in srgb, var(--royal-violet) 40%, transparent)" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Text input */}
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Caută în catalogul EVEM…"
                  className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:font-normal"
                  style={{
                    color: "var(--dark-amethyst)",
                  }}
                />

                {/* Clear / close */}
                <AnimatePresence>
                  {inputValue ? (
                    <motion.button
                      key="clear"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setInputValue("")}
                      className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X size={10} strokeWidth={2.5} />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="close"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.12 }}
                      onClick={handleClose}
                      className="shrink-0 flex items-center gap-1.5 text-zinc-300 hover:text-zinc-500 transition-colors"
                    >
                      <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400">
                        esc
                      </kbd>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div
                className="mt-3 h-px w-full overflow-hidden rounded-full"
                style={{ background: "color-mix(in srgb, var(--royal-violet) 6%, transparent)" }}
              >
                <AnimatePresence>
                  {isCurrentlySearching && (
                    <motion.div
                      key="bar"
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

            {/* ── Results body ───────────────────────────────────────────── */}
            <div className="overflow-y-auto flex-1 luxury-scrollbar">
              {!isConfigValid ? (
                <div className="py-10 text-center text-[10px] uppercase tracking-[0.45em] text-red-400 px-6">
                  Sincronizare eșuată. Verificați VITE_MEILI_URL și
                  VITE_MEILI_SEARCH_KEY.
                </div>
              ) : isCurrentlySearching && !initialSearchDone ? (
                /* ── Skeleton rows ── */
                <div className="py-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={`sk-${i}`}>
                      <RowSkeleton index={i} />
                      {i < 5 && <Sep />}
                    </div>
                  ))}
                </div>
              ) : hits.length > 0 ? (
                /* ── Real results ── */
                <div
                  className="py-2 transition-opacity duration-150"
                  style={{ opacity: isCurrentlySearching ? 0.38 : 1 }}
                >
                  {/* Result count label */}
                  <div className="px-5 pt-1 pb-2.5 flex items-center justify-between">
                    <span
                      className="text-[8.5px] uppercase tracking-[0.38em] font-black"
                      style={{ color: "color-mix(in srgb, var(--royal-violet) 32%, transparent)" }}
                    >
                      {hits.length} rezultate
                    </span>
                    {searchQuery && (
                      <span
                        className="text-[8.5px] font-semibold"
                        style={{ color: "color-mix(in srgb, var(--royal-violet) 32%, transparent)" }}
                      >
                        pentru „{searchQuery}"
                      </span>
                    )}
                  </div>

                  {hits.map((hit, i) => (
                    <div key={hit.id}>
                      <HitRow hit={hit} onClick={handleHitClick} index={i} />
                      {i < hits.length - 1 && <Sep />}
                    </div>
                  ))}
                </div>
              ) : showEmptyState ? (
                /* ── Empty state ── */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="py-12 flex flex-col items-center text-center px-8"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 8%, transparent), color-mix(in srgb, var(--mauve-magic) 12%, transparent))",
                    }}
                  >
                    <Search
                      size={18}
                      strokeWidth={1.2}
                      style={{ color: "color-mix(in srgb, var(--royal-violet) 38%, transparent)" }}
                    />
                  </div>
                  <p
                    className="text-[12px] font-semibold mb-1"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    Niciun rezultat
                  </p>
                  <p
                    className="text-[10px] font-medium"
                    style={{ color: "color-mix(in srgb, var(--royal-violet) 38%, transparent)" }}
                  >
                    Nimic pentru „{searchQuery}"
                  </p>
                </motion.div>
              ) : showInitialState ? (
                /* ── Initial idle state — minimal hint ── */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="py-12 flex flex-col items-center text-center px-8"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 8%, transparent), color-mix(in srgb, var(--mauve-magic) 12%, transparent))",
                    }}
                  >
                    <Sparkles
                      size={16}
                      strokeWidth={1.4}
                      style={{ color: "var(--royal-violet)" }}
                    />
                  </div>
                  <p
                    className="text-[12px] font-semibold"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    Începe să tastezi pentru a căuta
                  </p>
                  <p
                    className="text-[10px] font-medium mt-1"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 38%, transparent)",
                    }}
                  >
                    Produse, branduri, colecții
                  </p>
                </motion.div>
              ) : null}
            </div>


            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-2.5 border-t"
              style={{ borderColor: "color-mix(in srgb, var(--royal-violet) 6%, transparent)" }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles
                  size={9}
                  className="animate-pulse"
                  style={{ color: "color-mix(in srgb, var(--royal-violet) 35%, transparent)" }}
                />
                <span
                  className="text-[8px] uppercase tracking-[0.45em] font-black"
                  style={{ color: "color-mix(in srgb, var(--royal-violet) 28%, transparent)" }}
                >
                  Căutare inteligentă
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] font-medium text-zinc-300 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400 font-mono text-[8px]">
                    ↵
                  </kbd>
                  selectează
                </span>
                <span className="text-[9px] font-medium text-zinc-300 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400 font-mono text-[8px]">
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
