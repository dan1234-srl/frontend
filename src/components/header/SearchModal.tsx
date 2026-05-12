import { useMemo } from "react";
import { InstantSearch, SearchBox, Hits, Configure } from "react-instantsearch";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
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
      className="group flex flex-col gap-3 p-2 hover:bg-zinc-50/50 transition-all rounded-xl text-left"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-lg relative">
        <img
          src={hit.image_url}
          alt={hit.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {hit.sale_price && (
          <div className="absolute top-2 left-2 bg-black text-white text-[7px] font-black px-2 py-1 uppercase tracking-[0.2em]">
            Ofertă
          </div>
        )}
      </div>
      <div className="space-y-1 px-1">
        <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
          {hit.brand || "Evem Collection"}
        </p>
        <h4 className="text-[11px] font-semibold uppercase tracking-tight text-zinc-800 leading-tight line-clamp-2">
          {hit.name}
        </h4>
        <p className="text-[12px] font-black text-black">
          {hit.price?.toLocaleString()} RON
        </p>
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
          className="fixed inset-0 z-[1000] bg-white flex flex-col"
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-6 lg:px-16 py-8">
            <div className="flex items-center gap-3">
              <Sparkles size={12} className="text-zinc-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
                Luxury Concierge Search
              </span>
            </div>
            <button onClick={onClose} className="group flex items-center gap-4">
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
            {client ? (
              <InstantSearch indexName="products" searchClient={client}>
                <Configure hitsPerPage={12} />

                <div className="mb-20">
                  <SearchBox
                    autoFocus
                    placeholder="Caută în universul EVEM..."
                    classNames={{
                      root: "w-full",
                      input:
                        "w-full bg-transparent border-b border-zinc-200 py-6 text-3xl lg:text-7xl font-serif italic outline-none focus:border-black transition-all placeholder:text-zinc-100",
                      submit: "hidden",
                      reset: "hidden",
                    }}
                  />
                  <div className="mt-8 flex flex-wrap gap-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    <span className="text-zinc-500">Colecții:</span>
                    {["Diamante", "Aur 18K", "Brățări", "Noutăți"].map(
                      (tag) => (
                        <button
                          key={tag}
                          className="text-black hover:opacity-50 transition-opacity"
                        >
                          {tag}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                  <Hits
                    hitComponent={Hit}
                    classNames={{
                      list: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6",
                    }}
                  />
                </div>
              </InstantSearch>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-[0.5em] text-zinc-200">
                Sistemul de securitate se încarcă...
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
