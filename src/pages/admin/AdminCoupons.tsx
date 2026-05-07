import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Ticket,
  Plus,
  Search,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Edit3,
  Check,
  AlertCircle,
  Layers,
  Package,
  Tag,
  LayoutGrid,
  ShoppingBag,
  Percent,
  Ban,
  CheckCircle2,
  Activity,
  Settings2,
  Calendar,
  MousePointerClick,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminCoupons = () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. BRANDING & STYLE ENGINE (Backend Driven)
  // ─────────────────────────────────────────────────────────────────────────────
  const [brand, setBrand] = useState({
    dark_amethyst: "#001B3D",
    indigo_ink: "#0055FF",
    surface_bg: "#FAFAFA",
    text_primary: "#001B3D",
    primary_gradient: "linear-gradient(135deg, #0055FF 0%, #001B3D 100%)",
  });

  // Injectăm variabilele de brand ca CSS Custom Properties pe root-ul componentei
  const dynamicStyles = useMemo(
    () =>
      ({
        "--brand-primary": brand.indigo_ink,
        "--brand-dark": brand.dark_amethyst,
        "--brand-gradient": brand.primary_gradient,
      }) as React.CSSProperties,
    [brand],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. STATE MANAGEMENT (Paginare, Modal, Formulare)
  // ─────────────────────────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Paginare
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State Modal UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVoucherId, setCurrentVoucherId] = useState<string | null>(null);

  // State Date Formular
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "PERCENTAGE",
    discount_value: 0,
    min_order_value: 0,
    usage_limit: 0,
    is_active: true,
    applicable_category_ids: [] as string[],
    applicable_brand_names: [] as string[],
    applicable_product_ids: [] as string[],
  });

  // State Căutare Produse (S3 Catalog)
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [selectedProductsData, setSelectedProductsData] = useState<any[]>([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. API CONNECTIVITY (Sincronizare și Debounce)
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Preluare vouchere paginate și lista de categorii disponibile
      const [vouchersRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/vouchers/admin?page=${page}&size=10`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/api/v1/categories/`, { credentials: "include" }),
      ]);

      const vouchersData = await vouchersRes.json();
      setCoupons(vouchersData.items || []);
      setTotalPages(vouchersData.pages || 1);
      setTotalItems(vouchersData.total || 0);
      setCategories(await categoriesRes.json());
    } catch (e) {
      toast.error("Eroare de sincronizare cu baza de date AWS.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Căutare Produse - Rulează la fiecare modificare a input-ului, cu întârziere (debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (productSearchTerm.length >= 2) {
        setIsSearchingProducts(true);
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/products/search?q=${productSearchTerm}&size=5`,
          );
          const data = await res.json();
          setSearchedProducts(data.items || []);
        } catch (e) {
          console.error("Eroare la căutarea produselor:", e);
        } finally {
          setIsSearchingProducts(false);
        }
      } else {
        setSearchedProducts([]);
      }
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [productSearchTerm]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. LOGIC HANDLERS (Acțiuni utilizator)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentVoucherId(null);
    setFormData({
      code: "",
      discount_type: "PERCENTAGE",
      discount_value: 0,
      min_order_value: 0,
      usage_limit: 0,
      is_active: true,
      applicable_category_ids: [],
      applicable_brand_names: [],
      applicable_product_ids: [],
    });
    setSelectedProductsData([]);
    setProductSearchTerm("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (voucher: any) => {
    setIsEditing(true);
    setCurrentVoucherId(voucher.id);
    setFormData({
      code: voucher.code,
      discount_type: voucher.discount_type.toUpperCase(),
      discount_value: Number(voucher.discount_value),
      min_order_value: Number(voucher.min_order_value),
      usage_limit: voucher.usage_limit || 0,
      is_active: voucher.is_active,
      applicable_category_ids: voucher.applicable_category_ids || [],
      applicable_brand_names: voucher.applicable_brand_names || [],
      applicable_product_ids: voucher.applicable_product_ids || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Ești sigur că vrei să elimini permanent acest voucher? Acțiunea este ireversibilă.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vouchers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Voucherul a fost șters cu succes.");
        fetchData();
      } else {
        toast.error("Eroare la ștergerea campaniei.");
      }
    } catch (e) {
      toast.error("Eroare de conexiune la API.");
    }
  };

  const toggleProductSelection = (product: any) => {
    const isSelected = formData.applicable_product_ids.includes(product.id);
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        applicable_product_ids: prev.applicable_product_ids.filter(
          (id) => id !== product.id,
        ),
      }));
      setSelectedProductsData((prev) =>
        prev.filter((p) => p.id !== product.id),
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        applicable_product_ids: [...prev.applicable_product_ids, product.id],
      }));
      setSelectedProductsData((prev) => [...prev, product]);
    }
  };

  const handleSave = async () => {
    if (!formData.code || formData.discount_value <= 0) {
      return toast.error("Verifică parametrii obligatorii (Cod și Valoare).");
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_BASE_URL}/api/v1/vouchers/${currentVoucherId}`
      : `${API_BASE_URL}/api/v1/vouchers/`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(
          isEditing ? "Baza de date actualizată." : "Campanie activată global.",
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Modificarea a fost refuzată de server.");
      }
    } catch (e) {
      toast.error("Eroare fatală de conexiune la API.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. RENDER UI ENGINE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={dynamicStyles}
      className="w-full space-y-12 pb-24 font-sans text-left overflow-x-hidden bg-[#FAFAFA] min-h-screen"
    >
      {/* ── HEADER ULTRA MODERN ── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-zinc-200 pb-12 pt-6 px-4 md:px-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span
              className="w-12 h-[2px]"
              style={{ backgroundColor: "var(--brand-primary)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.5em]"
              style={{ color: "var(--brand-primary)" }}
            >
              Revenue Optimization Engine
            </span>
          </motion.div>
          <h1
            className="text-5xl md:text-7xl font-serif italic tracking-tighter"
            style={{ color: "var(--brand-dark)" }}
          >
            Promo{" "}
            <span style={{ color: "var(--brand-primary)" }}>Architect</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="bg-white border border-zinc-200 px-8 py-5 rounded-[2rem] flex items-center gap-5 shadow-sm w-full sm:w-auto">
            <Activity size={20} className="text-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-zinc-400">
                Puls Server
              </span>
              <span className="text-sm font-bold text-[var(--brand-dark)]">
                {totalItems} Vouchere Active
              </span>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ background: "var(--brand-gradient)" }}
          >
            <Plus size={18} /> Generează Voucher
          </button>
        </div>
      </header>

      {/* ── SECȚIUNE TABEL ANALITIC ── */}
      <div className="mx-4 md:mx-8 bg-white rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-b border-zinc-100">
                <TableHead className="py-8 px-12 text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  Identificator
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  Mecanism
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  Valoare
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  Grad Utilizare
                </TableHead>
                <TableHead className="text-center text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  Status
                </TableHead>
                <TableHead className="text-right px-12 text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  Gestiune
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-40 text-center">
                    <Loader2
                      className="animate-spin mx-auto mb-4"
                      size={40}
                      style={{ color: "var(--brand-primary)" }}
                    />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                      Sincronizare Cloud...
                    </p>
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-40 text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Niciun voucher nu a fost găsit în baza de date.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((c) => {
                  const usage = c.usage_limit
                    ? Math.min(100, (c.times_used / c.usage_limit) * 100)
                    : 0;
                  return (
                    <TableRow
                      key={c.id}
                      className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-50 last:border-none"
                    >
                      <TableCell className="px-12 py-10">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-base font-black text-[var(--brand-dark)] uppercase tracking-tight">
                            {c.code}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(c.code);
                              toast.success("Copiat în clipboard!");
                            }}
                            className="flex items-center gap-1.5 text-[9px] text-zinc-400 hover:text-[var(--brand-primary)] font-bold uppercase transition-colors w-fit"
                          >
                            <Copy size={10} /> Copiază Codul
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {c.discount_type === "PERCENTAGE" ? (
                            <Percent size={14} className="text-zinc-400" />
                          ) : (
                            <Ticket size={14} className="text-zinc-400" />
                          )}
                          <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                            {c.discount_type === "PERCENTAGE"
                              ? "Procentual"
                              : "Sumă Fixă"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-3xl font-serif italic font-black text-[var(--brand-dark)]">
                          {c.discount_value}
                          {c.discount_type === "PERCENTAGE" ? "%" : " RON"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 w-36">
                          <div className="flex justify-between text-[9px] font-black uppercase text-zinc-400">
                            <span>Consum Rețea</span>
                            <span style={{ color: "var(--brand-primary)" }}>
                              {c.times_used} / {c.usage_limit || "∞"}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${usage}%` }}
                              className="h-full rounded-full"
                              style={{ background: "var(--brand-gradient)" }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${c.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}
                        >
                          {c.is_active ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <Ban size={10} />
                          )}
                          {c.is_active ? "Activ" : "Oprit"}
                        </span>
                      </TableCell>
                      <TableCell className="px-12 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-4 rounded-2xl text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                            style={{ background: "var(--brand-gradient)" }}
                          >
                            <Edit3 size={16} />
                          </button>
                          {/* Variantă cu Delete tot cu gradient (poți schimba pe roșu dacă dorești distincție) */}
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-4 rounded-2xl text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                            style={{ background: "var(--brand-gradient)" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── PAGINARE SERVER-SIDE ── */}
        {totalPages > 1 && (
          <footer className="p-10 bg-zinc-50/80 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Pagina {page} din {totalPages}{" "}
              <span className="mx-3 opacity-30">|</span> {totalItems} Unități
              Indexate
            </span>
            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm disabled:opacity-30 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)]
                  .map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-12 h-12 rounded-2xl text-[11px] font-black transition-all shadow-sm ${page === i + 1 ? "text-white border-transparent" : "bg-white text-zinc-400 border border-zinc-100 hover:bg-zinc-50"}`}
                      style={{
                        background:
                          page === i + 1 ? "var(--brand-gradient)" : undefined,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm disabled:opacity-30 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL CONFIGURARE PROMO
          ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* bg-[#FBFBFD] pentru un fundal alb perlat și [&>button]:hidden pentru a elimina "X"-ul default */}
        <DialogContent className="max-w-[1200px] w-[96vw] h-[92vh] p-0 rounded-[3.5rem] border-none shadow-2xl flex flex-col overflow-hidden bg-[#FBFBFD] [&>button]:hidden">
          <header className="px-8 md:px-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border-b border-zinc-100 shrink-0">
            <div className="text-left space-y-2">
              <DialogTitle
                className="text-4xl md:text-5xl font-serif italic tracking-tight"
                style={{ color: "var(--brand-dark)" }}
              >
                {isEditing ? "Actualizare Parametri" : "Arhitectură Campanie"}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={14}
                  style={{ color: "var(--brand-primary)" }}
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Validare Securizată S3 + Bază de date
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-4 bg-zinc-50 px-6 py-3 rounded-2xl border border-zinc-100 shadow-inner">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                  Status Vizibilitate
                </span>
                <button
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative flex items-center px-1.5 shadow-inner ${formData.is_active ? "bg-emerald-500" : "bg-zinc-300"}`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: formData.is_active ? 28 : 0 }}
                  />
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-14 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm shrink-0"
              >
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 luxury-scrollbar">
            {/* ── SECȚIUNE 1: PARAMETRI CORE ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 bg-white p-8 md:p-12 rounded-[3rem] border border-zinc-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-4">
                  <Settings2
                    size={18}
                    style={{ color: "var(--brand-primary)" }}
                  />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Identitate Promoțională
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4 text-left">
                    <Label
                      className="text-[10px] font-black uppercase ml-2 opacity-50"
                      style={{ color: "var(--brand-dark)" }}
                    >
                      Cod Unic (Public)
                    </Label>
                    <input
                      disabled={isEditing}
                      className="w-full h-16 bg-zinc-50 border border-transparent rounded-[2rem] px-8 text-2xl font-black uppercase tracking-widest outline-none focus:bg-white focus:border-[var(--brand-primary)]/30 focus:shadow-[0_0_0_4px_rgba(0,85,255,0.05)] transition-all"
                      style={{ color: "var(--brand-dark)" }}
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="REDUCERE25"
                    />
                  </div>
                  <div className="space-y-4 text-left">
                    <Label
                      className="text-[10px] font-black uppercase ml-2 opacity-50"
                      style={{ color: "var(--brand-dark)" }}
                    >
                      Mecanism Calcul
                    </Label>
                    <select
                      className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[2rem] px-8 text-[11px] font-black uppercase outline-none shadow-inner"
                      style={{ color: "var(--brand-dark)" }}
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value,
                        })
                      }
                    >
                      <option value="PERCENTAGE">Procentual %</option>
                      <option value="FIXED_AMOUNT">Suma Fixă RON</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
                <div className="size-24 rounded-[2rem] flex items-center justify-center bg-zinc-50 shadow-inner">
                  <Percent
                    size={36}
                    style={{ color: "var(--brand-primary)" }}
                  />
                </div>
                <div className="space-y-3 w-full">
                  <Label
                    className="text-[10px] font-black uppercase opacity-50 tracking-widest"
                    style={{ color: "var(--brand-dark)" }}
                  >
                    Valoare Reducere
                  </Label>
                  <input
                    type="number"
                    className="w-full text-center text-7xl font-serif italic font-black bg-transparent outline-none"
                    style={{ color: "var(--brand-dark)" }}
                    value={formData.discount_value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* ── SECȚIUNE 2: RESTRICȚII DE PRAG ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 flex flex-col justify-center text-left">
                <Label className="text-[10px] font-black uppercase flex items-center gap-3 text-zinc-400">
                  <ShoppingBag size={16} /> Prag Comandă (RON)
                </Label>
                <input
                  type="number"
                  className="w-full h-16 bg-zinc-50 rounded-3xl text-center text-3xl font-black outline-none border border-transparent focus:border-[var(--brand-primary)]/20 transition-colors"
                  style={{ color: "var(--brand-dark)" }}
                  value={formData.min_order_value || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_order_value: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 flex flex-col justify-center text-left">
                <Label className="text-[10px] font-black uppercase flex items-center gap-3 text-zinc-400">
                  <Activity size={16} /> Limită Utilizări (Rețea)
                </Label>
                <input
                  type="number"
                  className="w-full h-16 bg-zinc-50 rounded-3xl text-center text-3xl font-black outline-none border border-transparent focus:border-[var(--brand-primary)]/20 transition-colors"
                  style={{ color: "var(--brand-dark)" }}
                  value={formData.usage_limit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usage_limit: Number(e.target.value),
                    })
                  }
                  placeholder="∞"
                />
              </div>
              <div
                className="p-10 rounded-[3rem] flex flex-col justify-center space-y-5"
                style={{
                  background: "var(--brand-dark)",
                  boxShadow: "0 20px 40px -10px rgba(0,27,61,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle
                    size={22}
                    style={{ color: "var(--brand-primary)" }}
                  />
                  <h4 className="text-[11px] font-black uppercase text-white tracking-widest">
                    Validare Inteligentă
                  </h4>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed opacity-80">
                  Dacă lăsați câmpurile de segmentare (de mai jos) goale,
                  sistemul va aplica voucherul în mod global pe întreg coșul de
                  cumpărături.
                </p>
              </div>
            </div>

            {/* ── SECȚIUNE 3: SEGMENTARE AVANSATĂ ── */}
            <div className="space-y-10">
              <div className="flex items-center gap-5">
                <span
                  className="w-16 h-[2px]"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                />
                <h3
                  className="text-sm font-black uppercase tracking-[0.4em]"
                  style={{ color: "var(--brand-dark)" }}
                >
                  Targetare & Segmentare Ierarhică
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Modul: Colecții & Categorii */}
                <div className="flex-1 overflow-y-auto luxury-scrollbar flex flex-wrap gap-4 content-start pr-2">
                  {categories.map((cat) => {
                    const active = formData.applicable_category_ids.includes(
                      cat.id,
                    );
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            applicable_category_ids: active
                              ? p.applicable_category_ids.filter(
                                  (id) => id !== cat.id,
                                )
                              : [...p.applicable_category_ids, cat.id],
                          }))
                        }
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-[2rem] border-2 transition-all duration-300 shadow-sm ${
                          active
                            ? "text-white border-transparent shadow-lg"
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                        }`}
                        style={{
                          // Când e activ, punem fundalul închis din brand. Când e inactiv, fundal alb.
                          backgroundColor: active
                            ? brand.dark_amethyst
                            : "#FFFFFF",
                          // Forțăm culoarea textului alb când e activ
                          color: active ? "#FFFFFF" : undefined,
                          // Optional: adăugăm un mic glow când e activ folosind culoarea de brand primary
                          boxShadow: active
                            ? `0 10px 20px -5px ${brand.dark_amethyst}40`
                            : "",
                        }}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
                ={/* Modul: Produse Specifice cu Search Live */}
                <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-8 h-[550px] flex flex-col text-left">
                  <Label
                    className="text-[11px] font-black uppercase flex items-center gap-4"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    <Package size={20} /> Fixare pe Articole
                  </Label>

                  <div className="relative">
                    <Search
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={20}
                    />
                    <input
                      className="w-full h-16 bg-zinc-50 pl-16 rounded-3xl text-[11px] font-bold outline-none border border-transparent focus:border-[var(--brand-primary)]/20 focus:bg-white transition-all shadow-inner focus:shadow-none"
                      placeholder="Caută în catalogul extins..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />

                    {/* Dropdown Rezultate Search */}
                    <AnimatePresence>
                      {searchedProducts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-[calc(100%+10px)] left-0 w-full bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-zinc-100 z-50 overflow-hidden"
                        >
                          <div className="max-h-[250px] overflow-y-auto luxury-scrollbar">
                            {searchedProducts.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  toggleProductSelection(p);
                                  setProductSearchTerm("");
                                }}
                                className="p-5 hover:bg-zinc-50 cursor-pointer flex items-center justify-between border-b border-zinc-50 last:border-none transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="size-12 bg-zinc-100 rounded-2xl overflow-hidden shadow-inner shrink-0">
                                    <img
                                      src={p.image_url || "/placeholder.png"}
                                      className="w-full h-full object-cover"
                                      alt={p.name}
                                    />
                                  </div>
                                  <span
                                    className="text-[10px] font-black uppercase tracking-tight line-clamp-2"
                                    style={{ color: "var(--brand-dark)" }}
                                  >
                                    {p.name}
                                  </span>
                                </div>
                                <div className="p-2 bg-zinc-50 rounded-full shrink-0">
                                  <Plus
                                    size={16}
                                    style={{ color: "var(--brand-primary)" }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Lista produselor selectate */}
                  <div className="flex-1 overflow-y-auto luxury-scrollbar space-y-3 pr-2">
                    {selectedProductsData.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Tag size={50} />
                        <p className="text-[10px] font-black uppercase mt-5 tracking-widest text-center">
                          Nicio excepție pe produs adăugată
                        </p>
                      </div>
                    )}
                    {selectedProductsData.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center bg-zinc-50 p-4 rounded-3xl border border-zinc-100 group"
                      >
                        <div className="flex items-center gap-4">
                          <Package
                            size={16}
                            className="text-zinc-400 shrink-0"
                          />
                          <span
                            className="text-[10px] font-black uppercase truncate max-w-[180px] sm:max-w-[250px]"
                            style={{ color: "var(--brand-dark)" }}
                          >
                            {p.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleProductSelection(p)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all shrink-0"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 md:px-12 py-10 bg-white border-t border-zinc-100 shrink-0">
            <button
              onClick={handleSave}
              className="w-full py-8 rounded-[3rem] text-white text-[14px] font-black uppercase tracking-[0.5em] shadow-[0_20px_40px_-15px_rgba(0,85,255,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(0,85,255,0.6)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-none"
              style={{
                // MODIFICARE AICI: Folosim direct valoarea din state-ul 'brand'
                background: brand.primary_gradient,
                // Forțăm culoarea textului să fie albă
                color: "#FFFFFF",
              }}
            >
              <MousePointerClick size={22} color="#FFFFFF" strokeWidth={3} />
              <span className="drop-shadow-sm">
                {isEditing
                  ? "Confirmă Actualizarea"
                  : "Lansează Voucherul în Rețea"}
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
