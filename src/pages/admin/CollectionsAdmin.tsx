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

  // Stări pentru UI/Formulare
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Stări pentru Căutarea Inteligentă
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Funcție utilitară pentru extragerea corectă a imaginii
  const getImageUrl = (p: any) => {
    try {
      let media = p.image_url;
      if (typeof media === "string" && media.trim().startsWith("{")) {
        media = JSON.parse(media);
      }
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

      if (!res.ok) throw new Error("Eroare server");

      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      setCollections([]);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-au putut încărca colecțiile.",
      });
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-au putut încărca produsele din colecție.",
      });
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchProducts(selectedCollection);
      setRenameValue(selectedCollection);
      setIsRenaming(false);
    } else {
      setProducts([]);
    }
  }, [selectedCollection]);

  // 🚀 Căutare Inteligentă (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/?search=${searchQuery}&limit=5`,
          { credentials: "include" },
        );
        const data = await res.json();
        setSearchResults(data.items || (Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- ACȚIUNI ---

  const handleRename = async () => {
    if (!selectedCollection || !renameValue.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/collections/${selectedCollection}/rename`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_type: renameValue.trim() }),
        },
      );
      if (!res.ok) throw new Error();

      toast({ title: "Succes", description: "Colecția a fost redenumită." });
      setSelectedCollection(renameValue.trim());
      fetchCollections();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-a putut redenumi.",
      });
    }
  };

  const handleDeleteCollection = async (type: string) => {
    if (
      !window.confirm(
        `Sigur ștergi colecția "${type}"? Toate asocierile vor fi pierdute.`,
      )
    )
      return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/collections/${type}`, {
        method: "DELETE",
      });
      toast({ title: "Colecție ștearsă" });
      if (selectedCollection === type) setSelectedCollection(null);
      fetchCollections();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-a putut șterge colecția.",
      });
    }
  };

  const selectProductToAdd = async (product: any) => {
    const targetCollection = selectedCollection || newCollectionName.trim();
    if (!targetCollection) {
      toast({
        variant: "destructive",
        title: "Atenție",
        description: "Selectați sau scrieți un nume de colecție.",
      });
      return;
    }

    try {
      const res = await fetch(
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Eroare la adăugare");
      }

      toast({
        title: "Produs Adăugat",
        description: `${product.name} a fost adăugat.`,
      });
      setSearchQuery("");
      setSearchResults([]);

      if (!collections.includes(targetCollection)) {
        fetchCollections();
        setSelectedCollection(targetCollection);
      } else {
        fetchProducts(targetCollection);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: err.message,
      });
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!selectedCollection) return;
    try {
      await fetch(
        `${API_BASE_URL}/api/v1/collections/${selectedCollection}/remove/${productId}`,
        { method: "DELETE" },
      );
      fetchProducts(selectedCollection);
      toast({ title: "Produs eliminat din colecție" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "A apărut o problemă.",
      });
    }
  };

  const handleReorder = async (
    productId: string,
    currentPosition: number,
    direction: "up" | "down",
  ) => {
    if (!selectedCollection) return;
    const newPos =
      direction === "up" ? currentPosition - 1 : currentPosition + 1;
    if (newPos < 0) return;

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/collections/${selectedCollection}/reorder/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: newPos }),
        },
      );
      fetchProducts(selectedCollection);
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare la reordonare" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[var(--lavender-purple)]/20 text-[var(--royal-violet)] rounded-2xl">
          <FolderTree size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Colecții Dinamice
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Gestiune carusele și categorii de recomandări
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR STÂNGA: LISTĂ COLECȚII */}
        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">
            Colecții Active
          </h2>

          <div className="space-y-2 mb-6">
            {collections.map((type) => (
              <div
                key={type}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${selectedCollection === type ? "bg-[var(--royal-violet)] border-[var(--royal-violet)] text-white shadow-md" : "bg-zinc-50 border-zinc-100 hover:border-zinc-300 text-zinc-700"}`}
                onClick={() => setSelectedCollection(type)}
              >
                <span className="font-bold text-sm tracking-wide">{type}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(type);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${selectedCollection === type ? "hover:bg-white/20 text-white" : "hover:bg-red-100 text-zinc-400 hover:text-red-500"}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {collections.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-4 italic">
                Nu există colecții.
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
              placeholder="ex: summer-2026"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[var(--royal-violet)] transition-colors mb-3"
            />
            <p className="text-[10px] text-zinc-500 px-2 leading-tight">
              Colecția va fi salvată automat când adaugi primul produs în ea.
            </p>
          </div>
        </div>

        {/* PANOUL DREAPTA: DETALII ȘI PRODUSE */}
        <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
          {!selectedCollection && !newCollectionName ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 opacity-60">
              <FolderTree size={48} strokeWidth={1} />
              <p className="text-sm font-medium">
                Selectați o colecție din stânga pentru a o edita.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Header Editare */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--royal-violet)] mb-1">
                      Colecție Selectată
                    </p>
                    {isRenaming && selectedCollection ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold outline-none w-48 focus:border-[var(--royal-violet)]"
                        />
                        <button
                          onClick={handleRename}
                          className="px-4 py-2 bg-[var(--royal-violet)] text-white text-[10px] font-black uppercase rounded-lg hover:brightness-110"
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
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                          {selectedCollection || newCollectionName}
                        </h2>
                        {selectedCollection && (
                          <button
                            onClick={() => setIsRenaming(true)}
                            className="text-zinc-400 hover:text-[var(--royal-violet)] transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Adăugare Produs cu SEARCH */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 relative z-20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                    Caută și Adaugă Produs
                  </p>

                  <div className="relative">
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Caută după nume sau SKU..."
                        className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-9 pr-10 text-xs font-semibold outline-none focus:border-[var(--royal-violet)] transition-colors"
                      />
                      {isSearching && (
                        <Loader2
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--royal-violet)] animate-spin"
                        />
                      )}
                    </div>

                    {/* REZULTATE CĂUTARE DROPDOWN */}
                    {searchResults.length > 0 && searchQuery.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {searchResults.map((p) => {
                          const img = getImageUrl(p);
                          return (
                            <div
                              key={p.id}
                              onClick={() => selectProductToAdd(p)}
                              className="flex items-center gap-3 p-3 hover:bg-zinc-50 cursor-pointer transition-colors border-b border-zinc-50 last:border-0"
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
                                <p className="text-xs font-bold text-zinc-900 truncate">
                                  {p.name}
                                </p>
                                <p className="text-[9px] text-zinc-400 font-mono">
                                  {p.sku}
                                </p>
                              </div>
                              <span className="text-[10px] font-black text-zinc-900 px-2 py-1 bg-zinc-100 rounded-md">
                                {p.price.toLocaleString()} RON
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de Produse Selectate */}
                {selectedCollection && (
                  <div className="space-y-4 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">
                      Produse în {selectedCollection} ({products.length})
                    </p>
                    <div className="space-y-2">
                      {products.map((p, idx) => {
                        const img = getImageUrl(p);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-4 p-3 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-all shadow-sm"
                          >
                            {/* Poze si Info */}
                            <div className="size-12 rounded-lg bg-zinc-50 overflow-hidden border border-zinc-100 shrink-0 flex items-center justify-center text-[8px] text-zinc-400">
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
                              <h4 className="text-sm font-bold text-zinc-900 truncate">
                                {p.name}
                              </h4>
                              <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                                {p.sku}
                              </p>
                            </div>

                            {/* Actiuni (Order & Delete) */}
                            <div className="flex items-center gap-1.5 mr-2">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => handleReorder(p.id, idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 rounded-md bg-zinc-50 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleReorder(p.id, idx, "down")
                                  }
                                  disabled={idx === products.length - 1}
                                  className="p-1 rounded-md bg-zinc-50 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                                >
                                  <ArrowDown size={12} />
                                </button>
                              </div>
                              <div className="w-px h-8 bg-zinc-100 mx-2" />
                              <button
                                onClick={() => handleRemoveProduct(p.id)}
                                className="size-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {products.length === 0 && (
                        <p className="text-center py-8 text-xs font-semibold text-zinc-400 italic bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                          Această colecție nu are niciun produs. Căutați un
                          produs mai sus pentru a-l adăuga.
                        </p>
                      )}
                    </div>
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
