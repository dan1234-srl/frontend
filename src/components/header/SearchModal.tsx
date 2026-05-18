import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
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

  // Preluăm variabilele de mediu
  const meiliUrl = import.meta.env.VITE_MEILI_URL;
  const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

  // Verificăm validitatea configurației pentru a randa interfața
  const isConfigValid = useMemo(() => {
    return !!(meiliUrl && meiliUrl.startsWith("http") && meiliKey);
  }, [meiliUrl, meiliKey]);

  // Executăm căutarea direct prin fetch nativ cu Debounce
  useEffect(() => {
    if (!isConfigValid || !isOpen) return;

    setSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`${meiliUrl}/indexes/products/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${meiliKey}`, // 🚀 Trimite token-ul securizat ca Bearer
          },
          body: JSON.stringify({
            q: query,
            limit: 18,
          }),
        });

        if (!response.ok) {
          throw new Error(`MeiliSearch server error: ${response.status}`);
        }

        const data = await response.json();
        setHits(data.hits || []);
      } catch (error) {
        console.error("Eroare la request-ul nativ MeiliSearch:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, meiliUrl, meiliKey, isConfigValid, isOpen]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const HitCard = ({ hit }: { hit: any }) => {
    const parsedImage = useMemo(() => {
      if (!hit.image_url) return hit.image || "";

      if (
        typeof hit.image_url === "string" &&
        hit.image_url.startsWith("http")
      ) {
        return hit.image_url;
      }

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
        onClick={() => {
          navigate(`/product/${hit.slug}`);
          handleClose();
        }}
        className="group flex flex-col gap-3 p-2 hover:bg-zinc-50/50 transition-all rounded-xl text-left w-full"
      >
        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-lg relative border border-zinc-100/50">
          <img
            src={parsedImage}
            alt={hit.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/600x800?text=Fara+Imagine";
            }}
          />
          {hit.sale_price < hit.original_price && (
            <div className="absolute top-2 left-2 bg-black text-white text-[7px] font-black px-2 py-1 uppercase tracking-[0.2em]">
              Ofertă
            </div>
          )}
        </div>
        <div className="space-y-1 px-1">
          <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
            {hit.brand || "Colecție Nouă"}
          </p>
          <h4 className="text-[11px] font-semibold uppercase tracking-tight text-zinc-800 leading-tight line-clamp-2">
            {hit.name}
          </h4>
          <p className="text-[12px] font-black text-black">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-white flex flex-col"
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-6 lg:px-16 py-8 border-b border-zinc-50">
            <div className="flex items-center gap-3">
              <Sparkles size={12} className="text-zinc-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
                Sistem Inteligent de Căutare
              </span>
            </div>
            <button
              onClick={handleClose}
              className="group flex items-center gap-4"
            >
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:mr-2 transition-all">
                Închide
              </span>
              <div className="h-12 w-12 border border-zinc-100 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <X size={18} strokeWidth={1.2} />
              </div>
            </button>
          </div>

          {/* SEARCH BOX AREA */}
          <div className="flex-1 overflow-hidden flex flex-col max-w-6xl mx-auto w-full px-6 pt-10">
            {isConfigValid ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="mb-12 relative">
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Caută în catalogul de produse..."
                    className="w-full bg-transparent border-b border-zinc-200 py-6 text-2xl lg:text-5xl font-serif italic outline-none focus:border-black transition-all placeholder:text-zinc-200 text-black pr-10"
                  />

                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-2"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <div className="mt-6 flex flex-wrap gap-6 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    <span className="text-zinc-500">Sugestii:</span>
                    {["Noutăți", "Cele mai vândute", "Oferte"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQuery(tag)}
                        className="text-black hover:opacity-50 transition-opacity"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zona de afișare rezultate */}
                <div className="flex-1 overflow-y-auto pb-20 no-scrollbar relative">
                  {searching && hits.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-zinc-300 text-[10px] uppercase tracking-[0.3em] animate-pulse">
                      Se caută rezultate...
                    </div>
                  ) : hits.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {hits.map((hit) => (
                        <HitCard key={hit.id} hit={hit} />
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-zinc-300 text-[10px] uppercase tracking-[0.3em]">
                      {query
                        ? `Nu s-au găsit produse pentru "${query}"`
                        : "Introdu un cuvânt cheie..."}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-[0.5em] text-zinc-300 text-center px-4">
                Sincronizare cu baza de date eșuată... Verifică configurația
                cheilor în Vercel
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
