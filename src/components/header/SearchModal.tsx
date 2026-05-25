import {
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
  useTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 SKELETON CARD (Izolat și foarte ușor de randat)
// ─────────────────────────────────────────────────────────────────────────────
const HitSkeleton = memo(() => (
  <div className="flex flex-col gap-3 p-3 rounded-2xl w-full h-full">
    <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-xl relative border border-zinc-100/50 flex-shrink-0 animate-pulse" />
    <div className="space-y-2 px-1 flex-1 flex flex-col">
      <div className="h-2 w-1/3 bg-zinc-100 rounded animate-pulse" />
      <div className="h-3 w-3/4 bg-zinc-200 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-zinc-200 rounded animate-pulse" />
      <div className="mt-auto h-4 w-1/2 bg-zinc-100 rounded animate-pulse" />
    </div>
  </div>
));
HitSkeleton.displayName = "HitSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 HIT CARD (Complet Memoizat)
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
      } catch (e) {
        return hit.image || "";
      }
    }, [hit.image_url, hit.image]);

    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => onClick(hit.slug)}
        className="group flex flex-col gap-3 p-3 hover:bg-zinc-50 transition-colors duration-200 rounded-2xl text-left w-full h-full"
      >
        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-xl relative border border-zinc-100/50 flex-shrink-0 transform-gpu">
          <img
            src={parsedImage}
            alt={hit.name}
            className={`w-full h-full object-cover transition-opacity duration-300 transform-gpu group-hover:scale-105 ${
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
            <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
          )}

          {hit.sale_price < hit.original_price && (
            <div className="absolute top-2 left-2 bg-[var(--dark-amethyst)] text-white text-[8px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-lg">
              Ofertă
            </div>
          )}
        </div>
        <div className="space-y-1.5 px-1 flex-1 flex flex-col">
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold line-clamp-1">
            {hit.brand || "Colecție Nouă"}
          </p>
          <h4 className="text-[12px] font-semibold tracking-tight text-zinc-800 leading-snug line-clamp-2 flex-1">
            {hit.name}
          </h4>
          <p className="text-[13px] font-black text-black pt-1">
            {hit.price ? `${Number(hit.price).toLocaleString()} RON` : "---"}
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
  // Folosim o valoare locală pentru input ca să nu blocăm tastarea
  const [inputValue, setInputValue] = useState("");
  // Valoarea "debounced" pe care o trimitem efectiv la fetch
  const [searchQuery, setSearchQuery] = useState("");

  const [hits, setHits] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition(); // React 18 Magic 🚀
  const [isFetching, setIsFetching] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  const meiliUrl = import.meta.env.VITE_MEILI_URL;
  const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

  const isConfigValid = useMemo(() => {
    return !!(meiliUrl && meiliUrl.startsWith("http") && meiliKey);
  }, [meiliUrl, meiliKey]);

  // Debounce pentru a aștepta ca utilizatorul să termine de tastat
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300); // Așteptăm 300ms după ultima apăsare de tastă
    return () => clearTimeout(timer);
  }, [inputValue, isOpen]);

  // Fetch separat, ascultă doar de 'searchQuery'
  useEffect(() => {
    if (!isConfigValid || !isOpen) return;

    const performSearch = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`${meiliUrl}/indexes/products/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${meiliKey}`,
          },
          body: JSON.stringify({ q: searchQuery, limit: 18 }),
        });
        const data = await response.json();

        // 🚀 startTransition amână randarea DOM-ului până când input-ul e liber
        startTransition(() => {
          setHits(data.hits || []);
          setInitialSearchDone(true);
        });
      } catch (error) {
        console.error("Eroare MeiliSearch:", error);
      } finally {
        setIsFetching(false);
      }
    };

    performSearch();
  }, [searchQuery, meiliUrl, meiliKey, isConfigValid, isOpen]);

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

  const handleSuggestionClick = (tag: string) => {
    setInputValue(tag);
    // Dacă utilizatorul alege o sugestie, o trimitem instant
    setSearchQuery(tag);
  };

  // Starea vizuală de "încărcare" combină atât rețeaua (isFetching) cât și calculul React (isPending)
  const isCurrentlySearching =
    isFetching || isPending || inputValue !== searchQuery;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-white/95 flex flex-col transform-gpu"
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-6 lg:px-16 py-8 border-b border-zinc-100 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                Sistem Inteligent de Căutare
              </span>
            </div>
            <button
              onClick={handleClose}
              className="group flex items-center gap-4 text-zinc-400 hover:text-black transition-colors"
            >
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:mr-2 transition-all">
                Închide
              </span>
              <div className="h-12 w-12 border border-zinc-200 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                <X size={18} strokeWidth={1.5} />
              </div>
            </button>
          </div>

          {/* SEARCH BOX AREA */}
          <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 pt-12 overflow-hidden">
            {isConfigValid ? (
              <div className="flex flex-col h-full w-full">
                <div className="mb-8 relative shrink-0">
                  <div className="relative flex items-center w-full">
                    <Search
                      className="absolute left-0 text-zinc-300"
                      size={32}
                      strokeWidth={1}
                    />
                    <input
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Caută în catalogul de produse..."
                      // Am eliminat font-serif dacă era prea "greu" la render
                      className="w-full bg-transparent border-b-2 border-zinc-100 py-6 pl-14 pr-14 text-3xl lg:text-5xl italic outline-none focus:border-[var(--dark-amethyst)] transition-colors placeholder:text-zinc-200 text-black"
                    />

                    {/* Loader Input */}
                    <div className="absolute right-2 flex items-center gap-2">
                      <AnimatePresence>
                        {isCurrentlySearching && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                          >
                            <Loader2
                              size={24}
                              className="text-[var(--dark-amethyst)] animate-spin"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {inputValue && !isCurrentlySearching && (
                        <button
                          onClick={() => setInputValue("")}
                          className="text-zinc-300 hover:text-black p-2 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <span className="text-zinc-300">Sugestii rapide:</span>
                    {["Noutăți", "Reduceri", "Premium"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSuggestionClick(tag)}
                        className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-500 hover:border-black hover:text-black hover:bg-zinc-50 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ZONA DE AFIȘARE REZULTATE */}
                <div className="flex-1 overflow-y-auto pb-32 luxury-scrollbar relative w-full transform-gpu">
                  {isCurrentlySearching && !initialSearchDone ? (
                    // 1. SKELETONS la prima încărcare
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                      {[...Array(12)].map((_, i) => (
                        <HitSkeleton key={`skel-${i}`} />
                      ))}
                    </div>
                  ) : hits.length > 0 ? (
                    // 2. PRODUSE GĂSITE
                    <div
                      className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 transition-opacity duration-150 ${
                        isCurrentlySearching ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      {/* AM SCOS <AnimatePresence mode="popLayout"> pentru performanță brută */}
                      {hits.map((hit) => (
                        <HitCard
                          key={hit.id}
                          hit={hit}
                          onClick={handleHitClick}
                        />
                      ))}
                    </div>
                  ) : initialSearchDone && !isCurrentlySearching ? (
                    // 3. ZERO REZULTATE
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-start pt-32 text-center"
                    >
                      <Search
                        size={48}
                        strokeWidth={0.5}
                        className="text-zinc-200 mb-6"
                      />
                      <h3 className="text-2xl font-serif italic text-zinc-400 mb-2">
                        Niciun rezultat găsit
                      </h3>
                      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
                        Nu am putut găsi produse pentru "
                        <span className="text-black">{searchQuery}</span>"
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
