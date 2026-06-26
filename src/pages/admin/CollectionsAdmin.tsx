/**
 * CollectionsAdmin.tsx
 * Gestionează colecțiile dinamice - Design Futuristic (Bento Neo-Mosaic)
 */

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
  Sparkles,
  Layers,
  Plus,
  GripVertical,
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

  // REORDONARE COLECȚII
  const handleReorderCollections = async (
    index: number,
    direction: "up" | "down",
  ) => {
    const newCollections = [...collections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCollections.length) return;

    [newCollections[index], newCollections[targetIndex]] = [
      newCollections[targetIndex],
      newCollections[index],
    ];

    setCollections(newCollections);

    try {
      await fetch(`${API_BASE_URL}/api/v1/collections/reorder-collections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordered_collections: newCollections }),
        credentials: "include",
      });
      toast({ title: "Ordine salvată cu succes!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Eroare la salvarea ordinii" });
    }
  };

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
          credentials: "include", // 👈 adaugă asta
        },
      );
      toast({
        title: "Sincronizare Reușită",
        description: `${product.name} a fost adăugat.`,
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
    if (!window.confirm("Atenție! Confirmă ștergerea colecției.")) return;
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
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in relative z-0">
      {/* ── HEADER FUTURISTIC ──────────────────────────────────────────────── */}
      <header
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pb-6 pt-4 border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Sparkles
              size={12}
              style={{ color: "var(--royal-violet)" }}
              className="animate-pulse"
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              System Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Colecții{" "}
            <span style={{ color: "var(--royal-violet)" }}>Dinamice</span>
          </h1>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* ── SIDEBAR STÂNGA: LISTĂ COLECȚII ───────────────────────────────── */}
        <div
          className="w-full lg:w-1/3 xl:w-1/4 bg-white/70 backdrop-blur-xl border rounded-[2rem] p-5 md:p-6 shadow-sm shrink-0"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="flex items-center gap-2 mb-5 px-1">
            <FolderTree size={14} style={{ color: "var(--royal-violet)" }} />
            <h2
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--dark-amethyst)" }}
            >
              Colecții Active
            </h2>
          </div>

          <div className="space-y-2.5 mb-6 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto luxury-scrollbar pr-2">
            {collections.map((type, idx) => {
              const isActive = selectedCollection === type;
              return (
                <div
                  key={type}
                  className={`group relative flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? "text-white shadow-lg shadow-[var(--royal-violet)]/20"
                      : "bg-white hover:bg-zinc-50/80 text-[var(--dark-amethyst)]"
                  }`}
                  style={{
                    background: isActive
                      ? "var(--primary-gradient)"
                      : undefined,
                    borderColor: isActive
                      ? "transparent"
                      : "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                  onClick={() => setSelectedCollection(type)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* SĂGEȚI REORDONARE */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderCollections(idx, "up");
                        }}
                        disabled={idx === 0}
                        className={`p-1 rounded-md transition-colors ${
                          isActive
                            ? "hover:bg-white/20 text-white/70 hover:text-white disabled:opacity-30"
                            : "hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 disabled:opacity-20"
                        }`}
                      >
                        <ArrowUp size={10} strokeWidth={3} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderCollections(idx, "down");
                        }}
                        disabled={idx === collections.length - 1}
                        className={`p-1 rounded-md transition-colors ${
                          isActive
                            ? "hover:bg-white/20 text-white/70 hover:text-white disabled:opacity-30"
                            : "hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 disabled:opacity-20"
                        }`}
                      >
                        <ArrowDown size={10} strokeWidth={3} />
                      </button>
                    </div>

                    <span className="font-bold text-xs tracking-wide truncate">
                      {type}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(type);
                    }}
                    className={`p-2 rounded-xl transition-all shrink-0 ml-2 ${
                      isActive
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-red-50 hover:bg-red-500 text-red-500 hover:text-white opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {collections.length === 0 && (
              <div
                className="py-10 text-center flex flex-col items-center gap-2 border border-dashed rounded-2xl"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                }}
              >
                <Layers
                  size={20}
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                  }}
                />
                <p
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                  }}
                >
                  Nicio colecție
                </p>
              </div>
            )}
          </div>

          {/* INPUT COLECȚIE NOUĂ */}
          <div
            className="pt-5 border-t"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <p
              className="text-[9px] font-black uppercase tracking-widest mb-3 px-1"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              + Colecție Nouă
            </p>
            <div className="relative">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => {
                  setNewCollectionName(e.target.value);
                  setSelectedCollection(null);
                }}
                placeholder="Ex: summer-sale"
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all placeholder:font-normal"
                style={{
                  color: "var(--dark-amethyst)",
                  boxShadow:
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px var(--royal-violet)";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                }}
              />
            </div>
          </div>
        </div>

        {/* ── PANOUL DREAPTA: PRODUSE (Bento) ──────────────────────────────── */}
        <div
          className="w-full lg:w-2/3 xl:w-3/4 bg-white/70 backdrop-blur-xl border rounded-[2rem] sm:rounded-[2.5rem] p-5 md:p-8 shadow-sm min-h-[500px] flex flex-col relative"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          {!selectedCollection && !newCollectionName ? (
            <div className="h-full flex-1 flex flex-col items-center justify-center space-y-4 py-20">
              <div
                className="p-6 rounded-3xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                }}
              >
                <PackageOpen
                  size={48}
                  strokeWidth={1}
                  style={{ color: "var(--royal-violet)" }}
                />
              </div>
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                }}
              >
                Selectează sau creează un segment
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full space-y-6 md:space-y-8"
              >
                {/* ── HEADER COLECȚIE ── */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 md:pb-6 border-b"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--royal-violet)" }}
                      />
                      <p
                        className="text-[8px] font-black uppercase tracking-[0.3em]"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                        }}
                      >
                        {newCollectionName && !selectedCollection
                          ? "Instanță Nouă"
                          : "Instanță Activă"}
                      </p>
                    </div>

                    {isRenaming && selectedCollection ? (
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="bg-white border rounded-xl px-4 py-2.5 text-lg font-black outline-none w-full max-w-[250px] transition-all focus:border-[var(--royal-violet)]"
                          style={{
                            color: "var(--dark-amethyst)",
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        />
                        <button
                          onClick={handleRename}
                          className="px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white rounded-xl shadow-md transition-all active:scale-95"
                          style={{ background: "var(--primary-gradient)" }}
                        >
                          Salvează
                        </button>
                        <button
                          onClick={() => setIsRenaming(false)}
                          className="px-5 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl bg-white border transition-all hover:bg-zinc-50"
                          style={{
                            color: "var(--dark-amethyst)",
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          Anulează
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight truncate text-[var(--dark-amethyst)]">
                          {selectedCollection || newCollectionName}
                        </h2>
                        {selectedCollection && (
                          <button
                            onClick={() => {
                              setRenameValue(selectedCollection);
                              setIsRenaming(true);
                            }}
                            className="p-2 rounded-xl bg-white border hover:bg-zinc-50 transition-colors shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                              color: "var(--royal-violet)",
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── SEARCH (Adăugare produse) ── */}
                <div
                  className="bg-white rounded-[1.5rem] p-4 md:p-5 relative z-20 border shadow-sm"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <p
                    className="text-[9px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    <Plus size={12} style={{ color: "var(--royal-violet)" }} />{" "}
                    Indexare Produs Nou
                  </p>
                  <div className="relative group">
                    <Search
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                      }}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Caută în DB (SKU / Nume)..."
                      className="w-full bg-zinc-50/50 backdrop-blur-sm border rounded-xl py-3.5 pl-10 pr-10 text-xs font-bold outline-none transition-all placeholder:font-normal"
                      style={{
                        color: "var(--dark-amethyst)",
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--royal-violet)";
                        e.target.style.backgroundColor = "#ffffff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                        e.target.style.backgroundColor =
                          "rgba(250,250,250,0.5)";
                      }}
                    />
                    {isSearching && (
                      <Loader2
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
                        style={{ color: "var(--royal-violet)" }}
                      />
                    )}

                    {/* REZULTATE SEARCH */}
                    {searchResults.length > 0 && searchQuery.length >= 2 && (
                      <div
                        className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border rounded-[1.5rem] shadow-2xl overflow-hidden max-h-72 overflow-y-auto luxury-scrollbar z-50"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        }}
                      >
                        {searchResults.map((p) => {
                          const img = getImageUrl(p);
                          return (
                            <div
                              key={p.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectProductToAdd(p);
                              }}
                              className="flex items-center gap-4 p-3.5 hover:bg-zinc-50 cursor-pointer border-b transition-colors group/item"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                              }}
                            >
                              <div
                                className="size-12 rounded-xl bg-white border overflow-hidden shrink-0 flex items-center justify-center text-[8px] font-black text-zinc-300"
                                style={{
                                  borderColor:
                                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                }}
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                                    alt=""
                                  />
                                ) : (
                                  "N/A"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[var(--dark-amethyst)] truncate group-hover/item:text-[var(--royal-violet)] transition-colors">
                                  {p.name}
                                </p>
                                <p
                                  className="text-[9px] font-black uppercase tracking-widest mt-0.5"
                                  style={{
                                    color:
                                      "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                                  }}
                                >
                                  {p.sku}
                                </p>
                              </div>
                              <span
                                className="text-[10px] font-black px-3 py-1.5 bg-white border rounded-lg shrink-0 text-[var(--dark-amethyst)] shadow-sm"
                                style={{
                                  borderColor:
                                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                                }}
                              >
                                {p.price?.toLocaleString()} RON
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── LISTA PRODUSE MAPPED ── */}
                {selectedCollection && (
                  <div className="flex-1 flex flex-col relative z-10">
                    <p
                      className="text-[9px] font-black uppercase tracking-widest mb-4 pl-1 flex items-center justify-between"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                      }}
                    >
                      <span>Matrice Produse</span>
                      <span className="text-[10px] px-2 py-0.5 bg-white border rounded-md text-[var(--dark-amethyst)] shadow-sm">
                        Total: {products.length}
                      </span>
                    </p>
                    <div className="space-y-3 flex-1">
                      {paginatedProducts.map((p, localIdx) => {
                        const globalIdx =
                          (currentPage - 1) * itemsPerPage + localIdx;
                        const img = getImageUrl(p);
                        return (
                          <motion.div
                            layout
                            key={p.id}
                            className="group flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-white border rounded-[1.5rem] hover:shadow-md transition-all relative overflow-hidden"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                            }}
                          >
                            {/* Hover Fill */}
                            <div
                              className="absolute inset-1 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                              style={{
                                background:
                                  "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 2%, transparent) 0%, transparent 100%)",
                              }}
                            />

                            <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                              {/* Grip Icon for visual hint */}
                              <GripVertical
                                size={14}
                                className="text-zinc-300 hidden sm:block shrink-0 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity"
                              />
                              <div
                                className="size-12 sm:size-14 rounded-2xl bg-zinc-50 overflow-hidden border shrink-0 flex items-center justify-center text-[8px] font-black text-zinc-300"
                                style={{
                                  borderColor:
                                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                }}
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  "IMG"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-[var(--dark-amethyst)] truncate">
                                  <span className="opacity-50 font-black mr-1">
                                    {globalIdx + 1}.
                                  </span>
                                  {p.name}
                                </h4>
                                <p
                                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5"
                                  style={{
                                    color:
                                      "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                                  }}
                                >
                                  SKU: {p.sku}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 sm:mr-2 shrink-0 relative z-10">
                              <div className="flex items-center sm:flex-col gap-1 sm:gap-1">
                                <button
                                  onClick={() =>
                                    handleReorderProducts(p.id, globalIdx, "up")
                                  }
                                  disabled={globalIdx === 0}
                                  className="p-1.5 bg-white border rounded-lg text-[var(--dark-amethyst)] hover:bg-[var(--royal-violet)] hover:text-white hover:border-transparent disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-inherit disabled:hover:border-inherit transition-all shadow-sm"
                                  style={{
                                    borderColor:
                                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                  }}
                                >
                                  <ArrowUp size={12} strokeWidth={2.5} />
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
                                  className="p-1.5 bg-white border rounded-lg text-[var(--dark-amethyst)] hover:bg-[var(--royal-violet)] hover:text-white hover:border-transparent disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-inherit disabled:hover:border-inherit transition-all shadow-sm"
                                  style={{
                                    borderColor:
                                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                  }}
                                >
                                  <ArrowDown size={12} strokeWidth={2.5} />
                                </button>
                              </div>
                              <div className="w-px h-8 bg-zinc-200 mx-2 hidden sm:block" />
                              <button
                                onClick={() => handleRemoveProduct(p.id)}
                                className="size-10 rounded-xl bg-white border text-red-500 hover:bg-red-500 hover:text-white hover:border-transparent flex items-center justify-center transition-all shadow-sm"
                                style={{
                                  borderColor:
                                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* ── PAGINATION (Bento style) ── */}
                    {totalPages > 1 && (
                      <div
                        className="flex items-center justify-between mt-6 pt-4 border-t"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                        }}
                      >
                        <button
                          onClick={() => setCurrentPage((p) => p - 1)}
                          disabled={currentPage === 1}
                          className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          <ChevronLeft
                            size={14}
                            style={{ color: "var(--royal-violet)" }}
                          />
                        </button>

                        <div className="flex gap-1.5">
                          {[...Array(totalPages)]
                            .map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${
                                  currentPage === i + 1
                                    ? "text-white border-transparent !text-white"
                                    : "bg-white hover:bg-zinc-50"
                                }`}
                                style={{
                                  background:
                                    currentPage === i + 1
                                      ? "var(--primary-gradient)"
                                      : undefined,
                                  borderColor:
                                    currentPage !== i + 1
                                      ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                                      : undefined,
                                  color:
                                    currentPage === i + 1
                                      ? "#ffffff"
                                      : "var(--dark-amethyst)",
                                }}
                              >
                                {i + 1}
                              </button>
                            ))
                            .slice(
                              Math.max(0, currentPage - 3),
                              Math.min(totalPages, currentPage + 2),
                            )}
                        </div>

                        <button
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          <ChevronRight
                            size={14}
                            style={{ color: "var(--royal-violet)" }}
                          />
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

      {/* GLOBAL SCROLLBAR STYLES (pentru liste interne) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--royal-violet) 40%, transparent); border-radius: 10px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--royal-violet); }
      `,
        }}
      />
    </div>
  );
};

export default CollectionsAdmin;
