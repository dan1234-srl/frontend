import { useMemo } from "react";
import { InstantSearch, SearchBox, Hits, Configure } from "react-instantsearch";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();

  const client = useMemo(() => {
    const url = import.meta.env.VITE_MEILI_URL;
    const key = import.meta.env.VITE_MEILI_SEARCH_KEY;
    if (!url || !url.startsWith("http")) return null;
    return instantMeiliSearch(url, key).searchClient;
  }, []);

  const Hit = ({ hit }: any) => (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        navigate(`/product/${hit.slug}`);
        onClose();
      }}
      className="group flex flex-col gap-4 p-4 hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100 rounded-lg"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-50 relative">
        <img
          src={hit.image_url}
          alt={hit.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {hit.sale_price && (
          <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest">
            Ofertă
          </div>
        )}
      </div>
      <div className="text-left space-y-1">
        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
          {hit.category || "Evem Collection"}
        </p>
        <h4 className="text-[11px] font-bold uppercase tracking-tight text-zinc-900 group-hover:text-black">
          {hit.name}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-black text-black">
            {hit.price?.toLocaleString()} RON
          </p>
          <ArrowRight
            size={10}
            className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </motion.button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-white/98 backdrop-blur-xl flex flex-col"
        >
          {/* HEADER MODAL */}
          <div className="flex items-center justify-between px-6 lg:px-16 py-8 border-b border-zinc-50">
            <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Căutare Inteligentă
              </span>
            </div>
            <button onClick={onClose} className="flex items-center gap-3 group">
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:mr-2 transition-all">
                Închide
              </span>
              <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center">
                <X size={16} />
              </div>
            </button>
          </div>

          {/* SEARCH CORE */}
          <div className="flex-1 overflow-hidden flex flex-col max-w-7xl mx-auto w-full px-6 lg:px-16 pt-12">
            {client ? (
              <InstantSearch indexName="products" searchClient={client}>
                <Configure hitsPerPage={12} />

                <div className="mb-16">
                  <SearchBox
                    autoFocus
                    placeholder="Ce piesă rară cauți astăzi?"
                    classNames={{
                      root: "w-full",
                      input:
                        "w-full bg-transparent border-b-2 border-zinc-100 py-6 text-2xl lg:text-5xl font-serif italic outline-none focus:border-black transition-all placeholder:text-zinc-200",
                      submit: "hidden",
                      reset: "hidden",
                    }}
                  />
                  <div className="mt-4 flex gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Sugestii:</span>
                    <button className="text-black hover:underline">
                      Inel Diamant
                    </button>
                    <button className="text-black hover:underline">
                      Aur 18K
                    </button>
                    <button className="text-black hover:underline">
                      Coliere
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                  <Hits
                    hitComponent={Hit}
                    classNames={{
                      list: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8",
                    }}
                  />
                </div>
              </InstantSearch>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-300 uppercase tracking-[0.5em] text-xs">
                Sistemul de căutare se încarcă...
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
