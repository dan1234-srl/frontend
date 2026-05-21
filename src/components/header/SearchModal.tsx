import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  const meiliUrl = import.meta.env.VITE_MEILI_URL;
  const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

  const isConfigValid = useMemo(() => {
    return !!(meiliUrl && meiliUrl.startsWith("http") && meiliKey);
  }, [meiliUrl, meiliKey]);

  useEffect(() => {
    if (!isConfigValid || !isOpen) return;

    // Funcție pentru a face fetch-ul fără să arate loader-ul (silent refresh)
    const performSearch = async (silent = false) => {
      if (!silent) setSearching(true);
      try {
        const response = await fetch(`${meiliUrl}/indexes/products/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${meiliKey}`,
          },
          body: JSON.stringify({ q: query, limit: 18 }),
        });
        const data = await response.json();
        setHits(data.hits || []);
      } catch (error) {
        console.error("Eroare MeiliSearch:", error);
      } finally {
        if (!silent) setSearching(false);
      }
    };

    // 1. Căutare inițială când se deschide sau se schimbă query-ul
    const delayDebounceFn = setTimeout(performSearch, 250);

    // 2. Interval de refresh la 10 secunde (doar dacă modalul e deschis)
    const refreshInterval = setInterval(() => {
      performSearch(true); // Silent update
    }, 10000);

    return () => {
      clearTimeout(delayDebounceFn);
      clearInterval(refreshInterval);
    };
  }, [query, meiliUrl, meiliKey, isConfigValid, isOpen]);

  const handleClose = () => {
    setQuery("");
    setHits([]);
    setInitialSearchDone(false);
    onClose();
  };

  // Componenta cardului izolată pentru a gestiona starea proprie de încărcare a imaginii
  const HitCard = ({ hit }: { hit: any }) => {
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
        layout // 🚀 Permite rearanjarea fluidă când alte carduri dispar
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => {
          navigate(`/product/${hit.slug}`);
          handleClose();
        }}
        className="group flex flex-col gap-3 p-3 hover:bg-zinc-50 transition-colors duration-300 rounded-2xl text-left w-full h-full"
      >
        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-xl relative border border-zinc-100/50 flex-shrink-0">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoaded ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            src={parsedImage}
            alt={hit.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x800?text=Fara+Imagine";
              setImgLoaded(true);
            }}
          />
          {/* Skeleton Pulse vizibil până se încarcă imaginea */}
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
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-[1000] bg-white/95 flex flex-col"
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-6 lg:px-16 py-8 border-b border-zinc-100 bg-white">
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
                <div className="mb-10 relative">
                  <div className="relative flex items-center w-full">
                    <Search
                      className="absolute left-0 text-zinc-300"
                      size={32}
                      strokeWidth={1}
                    />
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Caută în catalogul de produse..."
                      className="w-full bg-transparent border-b-2 border-zinc-100 py-6 pl-14 pr-14 text-3xl lg:text-6xl font-serif italic outline-none focus:border-[var(--dark-amethyst)] transition-all placeholder:text-zinc-200 text-black"
                    />

                    {/* Micro-interacțiune de Loading în Input */}
                    <div className="absolute right-2 flex items-center gap-2">
                      <AnimatePresence>
                        {searching && (
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

                      {query && !searching && (
                        <button
                          onClick={() => setQuery("")}
                          className="text-zinc-300 hover:text-black p-2 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <span className="text-zinc-300">Sugestii rapide:</span>
                    {["Noutăți", "Cele mai vândute", "Oferte"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-500 hover:border-black hover:text-black hover:bg-zinc-50 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zona de afișare rezultate */}
                <div className="flex-1 overflow-y-auto pb-32 no-scrollbar relative w-full">
                  <AnimatePresence mode="wait">
                    {!initialSearchDone && searching ? (
                      // Starea inițială la deschidere
                      <motion.div
                        key="initial-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center pt-20"
                      >
                        <Loader2
                          size={32}
                          className="text-zinc-200 animate-spin mb-4"
                        />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                          Sincronizare catalog...
                        </p>
                      </motion.div>
                    ) : hits.length > 0 ? (
                      // Grid-ul de produse
                      <motion.div
                        key="grid-results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // 🚀 Aici creăm efectul premium: dacă utilizatorul tastează din nou,
                        // grid-ul nu dispare, ci devine ușor opac/blurat
                        className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 transition-all duration-500 ${
                          searching
                            ? "opacity-40 blur-[2px] scale-[0.99] pointer-events-none"
                            : "opacity-100 blur-0 scale-100"
                        }`}
                      >
                        <AnimatePresence mode="popLayout">
                          {hits.map((hit) => (
                            <HitCard key={hit.id} hit={hit} />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      // Starea de "Not found" sau empty
                      <motion.div
                        key="no-results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
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
                          <span className="text-black">{query}</span>"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
