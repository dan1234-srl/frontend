import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  FolderTree,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const CollectionsAdmin = () => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [products, setProducts] = useState<any[]>([]);

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stări UI
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Stări Căutare
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const getImageUrl = (p: any) => {
    try {
      let media = p.image_url;
      if (typeof media === "string" && media.trim().startsWith("{"))
        media = JSON.parse(media);
      return (
        media?.main?.small ||
        media?.main?.medium ||
        (typeof media === "string" ? media : null)
      );
    } catch {
      return null;
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/collections/`, {
        credentials: "include",
      });
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch {
      setCollections([]);
    }
  };

  const fetchProducts = async (collectionType: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/collections/${collectionType}/products`,
        { credentials: "include" },
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-au putut încărca produsele.",
      });
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);
  useEffect(() => {
    if (selectedCollection) fetchProducts(selectedCollection);
  }, [selectedCollection]);

  // Căutare Meilisearch Endpoint
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/search/live?q=${encodeURIComponent(searchQuery)}&limit=5&is_admin_view=true`,
          { credentials: "include" },
        );
        const data = await res.json();
        setSearchResults(data.items || []);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 🚀 LOGICĂ NOUĂ: REORDONARE COLECȚII (Categorii)
  // 🚀 REORDONARE COLECȚII (MUTĂ CATEGORIILE ÎNTRE ELE)
  const handleReorderCollections = async (
    index: number,
    direction: "up" | "down",
  ) => {
    const newCollections = [...collections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Verificăm limitele
    if (targetIndex < 0 || targetIndex >= newCollections.length) return;

    // Interschimbăm elementele vizual instantaneu
    [newCollections[index], newCollections[targetIndex]] = [
      newCollections[targetIndex],
      newCollections[index],
    ];

    setCollections(newCollections);

    // Trimitem noua ordine la backend
    try {
      await fetch(`${API_BASE_URL}/api/v1/collections/reorder-collections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordered_collections: newCollections }),
        credentials: "include",
      });
      toast({ title: "Ordine salvată!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare la salvarea ordinii" });
    }
  };

  // --- RESTUL FUNCȚIILOR ---
  const selectProductToAdd = async (product: any) => {
    const targetCollection = selectedCollection || newCollectionName.trim();
    if (!targetCollection)
      return toast({
        variant: "destructive",
        title: "Atenție",
        description: "Selectați colecția.",
      });

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/collections/${targetCollection}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            position: products.length,
          }),
        },
      );
      toast({
        title: "Adăugat",
        description: `${product.name} inclus în ${targetCollection}`,
      });
      setSearchQuery("");
      setSearchResults([]);
      if (!collections.includes(targetCollection)) {
        await fetchCollections();
        setSelectedCollection(targetCollection);
      } else {
        await fetchProducts(targetCollection);
        setCurrentPage(Math.ceil((products.length + 1) / itemsPerPage));
      }
    } catch {
      toast({ variant: "destructive", title: "Eroare la adăugare" });
    }
  };

  const handleRename = async () => {
    if (!selectedCollection || !renameValue.trim()) return;
    await fetch(
      `${API_BASE_URL}/api/v1/collections/${selectedCollection}/rename`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_type: renameValue.trim() }),
      },
    );
    setSelectedCollection(renameValue.trim());
    fetchCollections();
    setIsRenaming(false);
  };

  const handleDeleteCollection = async (type: string) => {
    if (!window.confirm("Ștergi colecția?")) return;
    await fetch(`${API_BASE_URL}/api/v1/collections/${type}`, {
      method: "DELETE",
    });
    if (selectedCollection === type) setSelectedCollection(null);
    fetchCollections();
  };

  const handleRemoveProduct = async (productId: string) => {
    await fetch(
      `${API_BASE_URL}/api/v1/collections/${selectedCollection}/remove/${productId}`,
      { method: "DELETE" },
    );
    await fetchProducts(selectedCollection!);
    if (paginatedProducts.length === 1 && currentPage > 1)
      setCurrentPage((p) => p - 1);
  };

  const handleReorderProducts = async (
    productId: string,
    currentPos: number,
    direction: "up" | "down",
  ) => {
    const newPos = direction === "up" ? currentPos - 1 : currentPos + 1;
    if (newPos < 0 || newPos >= products.length) return;
    await fetch(
      `${API_BASE_URL}/api/v1/collections/${selectedCollection}/reorder/${productId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: newPos }),
      },
    );
    fetchProducts(selectedCollection!);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 md:mb-8">
        <div className="p-3 bg-[var(--lavender-purple)]/10 text-[var(--royal-violet)] rounded-2xl w-max">
          <FolderTree size={24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Colecții Dinamice
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Gestionează grupurile și ordinea lor pe Home Page.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* SIDEBAR STÂNGA: LISTĂ COLECȚII */}
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm shrink-0">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">
            Colecții Active
          </h2>
          <div className="space-y-2 mb-6 max-h-[40vh] lg:max-h-none overflow-y-auto custom-scrollbar pr-1">
            {collections.map((type, idx) => (
              <div
                key={type}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  selectedCollection === type
                    ? "bg-[var(--royal-violet)] border-[var(--royal-violet)] text-white shadow-md"
                    : "bg-zinc-50 border-zinc-100 hover:border-zinc-300 text-zinc-700"
                }`}
                onClick={() => setSelectedCollection(type)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* SĂGEȚI SUS/JOS PENTRU COLECȚII */}
                  <div className="flex flex-col gap-0.5 shrink-0 mr-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderCollections(idx, "up");
                      }}
                      disabled={idx === 0}
                      className="p-1 rounded bg-black/5 text-current opacity-60 hover:opacity-100 disabled:opacity-20"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderCollections(idx, "down");
                      }}
                      disabled={idx === collections.length - 1}
                      className="p-1 rounded bg-black/5 text-current opacity-60 hover:opacity-100 disabled:opacity-20"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>

                  <span className="font-bold text-sm tracking-wide truncate">
                    {type}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(type);
                  }}
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ml-2 ${
                    selectedCollection === type
                      ? "hover:bg-white/20 text-white"
                      : "hover:bg-red-100 text-zinc-400 hover:text-red-500"
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {collections.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-4 italic">
                Nu există nicio colecție.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3 px-2">
              Creează Colecție Nouă
            </p>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => {
                setNewCollectionName(e.target.value);
                setSelectedCollection(null);
              }}
              placeholder="Ex: summer-sale"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[var(--royal-violet)] mb-2"
            />
          </div>
        </div>

        {/* PANOUL DREAPTA: PRODUSE */}
        <div className="w-full lg:w-2/3 xl:w-3/4 bg-white border border-zinc-100 rounded-3xl p-5 md:p-8 shadow-sm min-h-[500px] flex flex-col">
          {!selectedCollection && !newCollectionName ? (
            <div className="h-full flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-4 opacity-60 py-20">
              <PackageOpen size={48} strokeWidth={1} />
              <p className="text-sm font-medium text-center px-4">
                Selectează o colecție din listă.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full space-y-6 md:space-y-8"
              >
                {/* HEADER COLECȚIE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 md:pb-6 border-b border-zinc-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--royal-violet)] mb-1">
                      {newCollectionName && !selectedCollection
                        ? "Colecție Nouă"
                        : "Colecție Activă"}
                    </p>
                    {isRenaming && selectedCollection ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold w-full max-w-[200px]"
                        />
                        <button
                          onClick={handleRename}
                          className="px-4 py-2 bg-[var(--royal-violet)] text-white text-[10px] font-black uppercase rounded-lg"
                        >
                          Salvează
                        </button>
                        <button
                          onClick={() => setIsRenaming(false)}
                          className="px-4 py-2 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase rounded-lg"
                        >
                          Anulează
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 truncate">
                          {selectedCollection || newCollectionName}
                        </h2>
                        {selectedCollection && (
                          <button
                            onClick={() => setIsRenaming(true)}
                            className="text-zinc-400 p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* SEARCH */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 md:p-5 relative z-20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                    Caută și Adaugă Produs
                  </p>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Caută după nume sau SKU..."
                      className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-9 pr-10 text-xs font-semibold outline-none focus:border-[var(--royal-violet)] shadow-sm"
                    />
                    {isSearching && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--royal-violet)] animate-spin"
                      />
                    )}

                    {/* REZULTATE */}
                    {searchResults.length > 0 && searchQuery.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-50">
                        {searchResults.map((p) => {
                          const img = getImageUrl(p);
                          return (
                            <div
                              key={p.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectProductToAdd(p);
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0"
                            >
                              <div className="size-10 bg-zinc-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-[8px] text-zinc-400">
                                {img ? (
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                ) : (
                                  "IMG"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">
                                  {p.name}
                                </p>
                                <p className="text-[9px] text-zinc-400 font-mono">
                                  {p.sku}
                                </p>
                              </div>
                              <span className="text-[10px] font-black px-2 py-1 bg-zinc-100 rounded-md shrink-0">
                                {p.price?.toLocaleString()} RON
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* LISTA PRODUSE */}
                {selectedCollection && (
                  <div className="flex-1 flex flex-col relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 pl-1">
                      Produse adăugate ({products.length})
                    </p>
                    <div className="space-y-2 flex-1">
                      {paginatedProducts.map((p, localIdx) => {
                        const globalIdx =
                          (currentPage - 1) * itemsPerPage + localIdx;
                        const img = getImageUrl(p);
                        return (
                          <motion.div
                            layout
                            key={p.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 shadow-sm"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="size-10 sm:size-12 rounded-lg bg-zinc-50 overflow-hidden border shrink-0">
                                {img ? (
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  "IMG"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold truncate">
                                  {globalIdx + 1}. {p.name}
                                </h4>
                                <p className="text-[9px] sm:text-[10px] font-mono text-zinc-500">
                                  SKU: {p.sku}
                                </p>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center justify-end gap-1.5 sm:mr-2 shrink-0">
                              <div className="flex items-center sm:flex-col gap-1 sm:gap-0.5">
                                <button
                                  onClick={() =>
                                    handleReorderProducts(p.id, globalIdx, "up")
                                  }
                                  disabled={globalIdx === 0}
                                  className="p-1.5 sm:p-1 bg-zinc-50 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 rounded-md"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleReorderProducts(
                                      p.id,
                                      globalIdx,
                                      "down",
                                    )
                                  }
                                  disabled={globalIdx === products.length - 1}
                                  className="p-1.5 sm:p-1 bg-zinc-50 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 rounded-md"
                                >
                                  <ArrowDown size={14} />
                                </button>
                              </div>
                              <div className="w-px h-6 sm:h-8 bg-zinc-100 mx-1 sm:mx-2 hidden sm:block" />
                              <button
                                onClick={() => handleRemoveProduct(p.id)}
                                className="size-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    {/* PAGINATION */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
                        <button
                          onClick={() => setCurrentPage((p) => p - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                        >
                          <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50 px-3 py-1.5 rounded-lg border">
                          Pagina {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsAdmin;
