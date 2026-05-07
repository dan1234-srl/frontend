import { useMemo } from "react";
import { InstantSearch, SearchBox, Hits, Configure } from "react-instantsearch";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const MEILI_URL = import.meta.env.VITE_MEILI_URL;
  const MEILI_KEY = import.meta.env.VITE_MEILI_SEARCH_KEY;

  const client = useMemo(() => {
    if (!MEILI_URL || !MEILI_URL.startsWith("http")) return null;
    try {
      const { searchClient } = instantMeiliSearch(MEILI_URL, MEILI_KEY);
      return searchClient;
    } catch {
      return null;
    }
  }, [MEILI_URL, MEILI_KEY]);

  const Hit = ({ hit }: any) => (
    <button
      type="button"
      onClick={() => {
        navigate(`/product/${hit.slug}`);
        onClose();
      }}
      className="flex items-center gap-4 px-6 py-4 hover:bg-surface w-full text-left border-b border-border last:border-0 group transition-colors"
    >
      <div className="aspect-[3/4] w-12 bg-surface shrink-0 overflow-hidden">
        <img
          src={hit.image_url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="label-micro text-muted-foreground mb-0.5">
          {hit.brand || "Linea"}
        </p>
        <h4 className="text-sm font-semibold text-foreground truncate">
          {hit.name}
        </h4>
      </div>
      <p className="text-sm font-bold text-foreground shrink-0">
        {hit.price?.toLocaleString()} RON
      </p>
      <ChevronRight
        size={14}
        strokeWidth={1.4}
        className="text-muted-foreground group-hover:text-foreground transition-colors"
      />
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[800] flex flex-col bg-foreground/40 backdrop-blur-md pt-20 sm:pt-28 px-4"
        >
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl mx-auto bg-card shadow-luxe border border-border flex flex-col max-h-[75vh] overflow-hidden"
          >
            {client ? (
              <InstantSearch indexName="products" searchClient={client}>
                <div className="px-6 py-5 border-b border-border flex items-center gap-4">
                  <Search
                    size={18}
                    strokeWidth={1.4}
                    className="text-muted-foreground"
                  />
                  <SearchBox
                    autoFocus
                    placeholder="Caută bijuterii, materiale, colecții…"
                    classNames={{
                      root: "flex-1",
                      input:
                        "w-full bg-transparent border-none focus:ring-0 text-base outline-none placeholder:text-muted-foreground/60",
                      submit: "hidden",
                      reset: "hidden",
                    }}
                  />
                  <button
                    onClick={onClose}
                    className="h-9 w-9 grid place-items-center border border-border hover:bg-foreground hover:text-background transition-colors"
                    aria-label="Close"
                  >
                    <X size={14} strokeWidth={1.4} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto luxury-scrollbar">
                  <Configure hitsPerPage={8} />
                  <Hits
                    hitComponent={Hit}
                    classNames={{ list: "flex flex-col" }}
                  />
                </div>
              </InstantSearch>
            ) : (
              <div className="px-10 py-16 text-center space-y-3">
                <AlertCircle
                  size={28}
                  strokeWidth={1.2}
                  className="mx-auto text-muted-foreground"
                />
                <p className="label-luxury">Căutarea nu este configurată</p>
                <button
                  onClick={onClose}
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
                >
                  Închide
                </button>
              </div>
            )}
          </motion.div>
          <div className="flex-1" onClick={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
