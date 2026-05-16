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
  CheckCircle2,
  Activity,
  Settings2,
  MousePointerClick,
  ShieldCheck,
  Package,
  Tag,
  Percent,
  Ban,
  Image as ImageIcon,
  LayoutTemplate,
  Globe2,
  AlertCircle,
  ShoppingBag, // 🚀 REPARAT CHIRURGICAL: Importul adăugat care elimina eroarea fatală de ReferenceError
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
  // 1. BRANDING & STYLE ENGINE
  // ─────────────────────────────────────────────────────────────────────────────
  const [brand, setBrand] = useState({
    dark_amethyst: "#001B3D",
    indigo_ink: "#0055FF",
    surface_bg: "#FAFAFA",
    text_primary: "#001B3D",
    primary_gradient: "linear-gradient(135deg, #0055FF 0%, #001B3D 100%)",
  });

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
  // 2. STATE MANAGEMENT GLOBAL & TAB-URI
  // ─────────────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"VOUCHERS" | "BANNERS">(
    "VOUCHERS",
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE VOUCHERE ---
  const [coupons, setCoupons] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isEditingVoucher, setIsEditingVoucher] = useState(false);
  const [currentVoucherId, setCurrentVoucherId] = useState<string | null>(null);

  const [voucherFormData, setVoucherFormData] = useState({
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

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<any[]>([]);
  const [selectedProductsData, setSelectedProductsData] = useState<any[]>([]);

  // --- STATE BANNERE EDITORIALE ---
  const [banners, setBanners] = useState<any[]>([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isEditingBanner, setIsEditingBanner] = useState(false);

  const [bannerFormData, setBannerFormData] = useState({
    id: "",
    category_id: "global_campaign_id",
    title: "",
    subtitle: "",
    button_text: "DESCOPERĂ COLECȚIA",
    image_desktop_url: "",
    image_mobile_url: "",
    is_active: true,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. API CONNECTIVITY
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [vouchersRes, categoriesRes, bannersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/vouchers/admin?page=${page}&size=10`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/api/v1/categories/`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/v1/vouchers/admin/banners`, {
          credentials: "include",
        }),
      ]);

      const vouchersData = await vouchersRes.json();
      setCoupons(vouchersData.items || []);
      setTotalPages(vouchersData.pages || 1);
      setTotalItems(vouchersData.total || 0);

      const cats = await categoriesRes.json();
      setCategories(cats);

      const bannersData = await bannersRes.json();
      setBanners(bannersData || []);
    } catch (e) {
      toast.error("Eroare de sincronizare cu baza de date.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (productSearchTerm.length >= 2) {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/products/search?q=${productSearchTerm}&size=5`,
          );
          const data = await res.json();
          setSearchedProducts(data.items || []);
        } catch (e) {
          console.error("Eroare la căutarea produselor:", e);
        }
      } else {
        setSearchedProducts([]);
      }
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [productSearchTerm]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. HANDLERS VOUCHERE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenVoucherCreate = () => {
    setIsEditingVoucher(false);
    setCurrentVoucherId(null);
    setVoucherFormData({
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
    setIsVoucherModalOpen(true);
  };

  const handleOpenVoucherEdit = (voucher: any) => {
    setIsEditingVoucher(true);
    setCurrentVoucherId(voucher.id);
    setVoucherFormData({
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
    setIsVoucherModalOpen(true);
  };

  const handleDeleteVoucher = async (id: string) => {
    if (
      !window.confirm("Ești sigur că vrei să elimini permanent acest voucher?")
    )
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vouchers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Voucherul a fost șters.");
        fetchData();
      } else toast.error("Eroare la ștergerea campaniei.");
    } catch (e) {
      toast.error("Eroare de conexiune la API.");
    }
  };

  const toggleProductSelection = (product: any) => {
    const isSelected = voucherFormData.applicable_product_ids.includes(
      product.id,
    );
    if (isSelected) {
      setVoucherFormData((prev) => ({
        ...prev,
        applicable_product_ids: prev.applicable_product_ids.filter(
          (id) => id !== product.id,
        ),
      }));
      setSelectedProductsData((prev) =>
        prev.filter((p) => p.id !== product.id),
      );
    } else {
      setVoucherFormData((prev) => ({
        ...prev,
        applicable_product_ids: [...prev.applicable_product_ids, product.id],
      }));
      setSelectedProductsData((prev) => [...prev, product]);
    }
  };

  const handleSaveVoucher = async () => {
    if (!voucherFormData.code || voucherFormData.discount_value <= 0) {
      return toast.error("Verifică parametrii obligatorii (Cod și Valoare).");
    }
    const method = isEditingVoucher ? "PUT" : "POST";
    const url = isEditingVoucher
      ? `${API_BASE_URL}/api/v1/vouchers/${currentVoucherId}`
      : `${API_BASE_URL}/api/v1/vouchers/`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(voucherFormData),
      });

      if (res.ok) {
        toast.success(
          isEditingVoucher ? "Voucher actualizat." : "Voucher creat.",
        );
        setIsVoucherModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Modificarea a fost refuzată.");
      }
    } catch (e) {
      toast.error("Eroare fatală de conexiune la API.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. HANDLERS BANNERE EDITORIALE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenBannerCreate = () => {
    setIsEditingBanner(false);
    setBannerFormData({
      id: "",
      category_id: "global_campaign_id",
      title: "",
      subtitle: "",
      button_text: "DESCOPERĂ COLECȚIA",
      image_desktop_url: "",
      image_mobile_url: "",
      is_active: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenBannerEdit = (banner: any) => {
    setIsEditingBanner(true);
    setBannerFormData({
      id: banner.id,
      category_id: banner.category_id || "global_campaign_id",
      title: banner.title,
      subtitle: banner.subtitle || "",
      button_text: banner.button_text || "DESCOPERĂ COLECȚIA",
      image_desktop_url: banner.image_desktop_url,
      image_mobile_url: banner.image_mobile_url || "",
      is_active: banner.is_active,
    });
    setIsBannerModalOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Ștergi definitiv acest banner din categorie?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/vouchers/admin/delete-banner/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (res.ok) {
        toast.success("Banner șters.");
        fetchData();
      } else toast.error("Eroare la ștergerea bannerului.");
    } catch (e) {
      toast.error("Eroare de conexiune API.");
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerFormData.title || !bannerFormData.image_desktop_url) {
      return toast.error("Titlul și Imaginea Desktop sunt obligatorii.");
    }

    const payload = {
      ...bannerFormData,
      category_id:
        bannerFormData.category_id === "global_campaign_id"
          ? null
          : bannerFormData.category_id,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/vouchers/admin/save-banner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        toast.success("Bannerul editorial a fost salvat și publicat.");
        setIsBannerModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Eroare la salvarea bannerului.");
      }
    } catch (e) {
      toast.error("Eroare de conexiune la API.");
    }
  };

  const getCategoryName = (id: string | null) => {
    if (!id || id === "global_campaign_id")
      return "🌍 CAMPANIE GLOBALĂ (TOT SITE-UL)";
    const cat = categories.find((c) => c.id === id);
    if (cat) return cat.name;
    for (const mainCat of categories) {
      if (mainCat.subcategories) {
        const sub = mainCat.subcategories.find((s: any) => s.id === id);
        if (sub) return `${mainCat.name} > ${sub.name}`;
      }
    }
    return "Categorie ștearsă/necunoscută";
  };

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
              Revenue & Marketing Engine
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
                Puls Marketing
              </span>
              <span className="text-sm font-bold text-[var(--brand-dark)]">
                {totalItems} Promo | {banners.length} Bannere
              </span>
            </div>
          </div>

          {activeTab === "VOUCHERS" ? (
            <button
              onClick={handleOpenVoucherCreate}
              className="w-full sm:w-auto text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              style={{ background: "var(--brand-gradient)" }}
            >
              <Plus size={18} /> Generează Voucher
            </button>
          ) : (
            <button
              onClick={handleOpenBannerCreate}
              className="w-full sm:w-auto text-white px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              style={{ background: "var(--brand-gradient)" }}
            >
              <ImageIcon size={18} /> Adaugă Banner
            </button>
          )}
        </div>
      </header>

      <div className="mx-4 md:mx-8 space-y-8">
        {/* ── TAB-URI DE NAVIGARE ── */}
        <div className="flex items-center gap-4 border-b border-zinc-200 pb-px">
          <button
            onClick={() => setActiveTab("VOUCHERS")}
            className={`flex items-center gap-2 pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "VOUCHERS"
                ? "text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Ticket size={16} /> Vouchere Checkout
          </button>
          <button
            onClick={() => setActiveTab("BANNERS")}
            className={`flex items-center gap-2 pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "BANNERS"
                ? "text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <LayoutTemplate size={16} /> Bannere Editoriale
          </button>
        </div>

        {/* ── SECȚIUNE TABEL ANALITIC ── */}
        <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden relative">
          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-b border-zinc-100">
                  {activeTab === "VOUCHERS" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <TableHead className="py-8 px-12 text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        Imagine / Preview
                      </TableHead>
                      <TableHead className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        Titlu & Text
                      </TableHead>
                      <TableHead className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        Afișare (Target)
                      </TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        Status
                      </TableHead>
                      <TableHead className="text-right px-12 text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                        Gestiune
                      </TableHead>
                    </>
                  )}
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
                ) : activeTab === "VOUCHERS" && coupons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-40 text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Niciun voucher nu a fost găsit în baza de date.
                    </TableCell>
                  </TableRow>
                ) : activeTab === "BANNERS" && banners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-40 text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Niciun banner editorial configurat momentan. Adăugați un
                      Banner Global pentru a începe.
                    </TableCell>
                  </TableRow>
                ) : activeTab === "VOUCHERS" ? (
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
                              onClick={() => handleOpenVoucherEdit(c)}
                              className="p-4 rounded-2xl text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                              style={{ background: "var(--brand-gradient)" }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteVoucher(c.id)}
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
                ) : (
                  // RENDERING TABEL BANNERE
                  banners.map((b) => {
                    const isGlobal = !b.category_id;
                    return (
                      <TableRow
                        key={b.id}
                        className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-50 last:border-none"
                      >
                        <TableCell className="px-12 py-6">
                          <div className="w-40 h-16 rounded-xl overflow-hidden shadow-sm border border-zinc-100 bg-zinc-100 relative">
                            {/* Folosim tag nativ img anti-CORS și adăugăm un handler discret onError */}
                            <img
                              src={b.image_desktop_url}
                              alt="Banner"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/600x400?text=S3+Secure+Image";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-black text-[var(--brand-dark)] uppercase tracking-widest">
                              {b.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                              {b.subtitle || "Fără subtitlu"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isGlobal ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase tracking-wider">
                              <Globe2 size={12} />
                              CAMPANIE GLOBALĂ
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                              {getCategoryName(b.category_id)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${b.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}
                          >
                            {b.is_active ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <Ban size={10} />
                            )}
                            {b.is_active ? "Afișat" : "Ascuns"}
                          </span>
                        </TableCell>
                        <TableCell className="px-12 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenBannerEdit(b)}
                              className="p-4 rounded-2xl text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                              style={{ background: "var(--brand-gradient)" }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(b.id)}
                              className="p-4 rounded-2xl text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all bg-rose-500"
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

          {/* PAGINARE DOAR PENTRU VOUCHERE */}
          {activeTab === "VOUCHERS" && totalPages > 1 && (
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
                            page === i + 1
                              ? "var(--brand-gradient)"
                              : undefined,
                        }}
                      >
                        {i + 1}
                      </button>
                    ))
                    .slice(
                      Math.max(0, page - 3),
                      Math.min(totalPages, page + 2),
                    )}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm disabled:opacity-30 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL CONFIGURARE VOUCHER
          ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
        <DialogContent className="max-w-[1200px] w-[96vw] h-[92vh] p-0 rounded-[3.5rem] border-none shadow-2xl flex flex-col overflow-hidden bg-[#FBFBFD] [&>button]:hidden">
          <header className="px-8 md:px-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border-b border-zinc-100 shrink-0">
            <div className="text-left space-y-2">
              <DialogTitle
                className="text-4xl md:text-5xl font-serif italic tracking-tight"
                style={{ color: "var(--brand-dark)" }}
              >
                {isEditingVoucher
                  ? "Actualizare Voucher"
                  : "Arhitectură Voucher"}
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
                    setVoucherFormData({
                      ...voucherFormData,
                      is_active: !voucherFormData.is_active,
                    })
                  }
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative flex items-center px-1 shadow-inner ${voucherFormData.is_active ? "bg-emerald-500" : "bg-zinc-300"}`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: voucherFormData.is_active ? 28 : 0 }}
                  />
                </button>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="size-14 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm shrink-0"
              >
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 luxury-scrollbar">
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
                      disabled={isEditingVoucher}
                      className="w-full h-16 bg-zinc-50 border border-transparent rounded-[2rem] px-8 text-2xl font-black uppercase tracking-widest outline-none focus:bg-white focus:border-[var(--brand-primary)]/30 focus:shadow-[0_0_0_4px_rgba(0,85,255,0.05)] transition-all"
                      style={{ color: "var(--brand-dark)" }}
                      value={voucherFormData.code}
                      onChange={(e) =>
                        setVoucherFormData({
                          ...voucherFormData,
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
                      value={voucherFormData.discount_type}
                      onChange={(e) =>
                        setVoucherFormData({
                          ...voucherFormData,
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
                    value={voucherFormData.discount_value || ""}
                    onChange={(e) =>
                      setVoucherFormData({
                        ...voucherFormData,
                        discount_value: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 flex flex-col justify-center text-left">
                <Label className="text-[10px] font-black uppercase flex items-center gap-3 text-zinc-400">
                  <ShoppingBag size={16} /> Prag Comandă (RON)
                </Label>
                <input
                  type="number"
                  className="w-full h-16 bg-zinc-50 rounded-3xl text-center text-3xl font-black outline-none border border-transparent focus:border-[var(--brand-primary)]/20 transition-colors"
                  style={{ color: "var(--brand-dark)" }}
                  value={voucherFormData.min_order_value || ""}
                  onChange={(e) =>
                    setVoucherFormData({
                      ...voucherFormData,
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
                  value={voucherFormData.usage_limit || ""}
                  onChange={(e) =>
                    setVoucherFormData({
                      ...voucherFormData,
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
                  Dacă lăsați câmpurile de segmentare goale, sistemul va aplica
                  voucherul global pe întreg coșul de cumpărături.
                </p>
              </div>
            </div>

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
                  Targetare & Segmentare
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="flex-1 overflow-y-auto luxury-scrollbar flex flex-wrap gap-4 content-start pr-2">
                  {categories.map((cat) => {
                    const active =
                      voucherFormData.applicable_category_ids.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setVoucherFormData((p) => ({
                            ...p,
                            applicable_category_ids: active
                              ? p.applicable_category_ids.filter(
                                  (id) => id !== cat.id,
                                )
                              : [...p.applicable_category_ids, cat.id],
                          }))
                        }
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-[2rem] border-2 transition-all duration-300 shadow-sm ${active ? "text-white border-transparent shadow-lg" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"}`}
                        style={{
                          backgroundColor: active
                            ? brand.dark_amethyst
                            : "#FFFFFF",
                          color: active ? "#FFFFFF" : undefined,
                        }}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
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
                      className="w-full h-16 bg-zinc-50 pl-16 rounded-3xl text-[11px] font-bold outline-none border border-transparent focus:border-[var(--brand-primary)]/20 transition-all shadow-inner"
                      placeholder="Caută în catalogul extins..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                    <AnimatePresence>
                      {searchedProducts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-[calc(100%+10px)] left-0 w-full bg-white shadow-2xl rounded-[2.5rem] border border-zinc-100 z-50 overflow-hidden"
                        >
                          <div className="max-h-[250px] overflow-y-auto luxury-scrollbar">
                            {searchedProducts.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  toggleProductSelection(p);
                                  setProductSearchTerm("");
                                }}
                                className="p-5 hover:bg-zinc-50 cursor-pointer flex items-center justify-between border-b border-zinc-50 last:border-none"
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
                  <div className="flex-1 overflow-y-auto luxury-scrollbar space-y-3 pr-2">
                    {selectedProductsData.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Tag size={50} />
                        <p className="text-[10px] font-black uppercase mt-5 tracking-widest text-center">
                          Nicio excepție adăugată
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
                            className="text-[10px] font-black uppercase truncate max-w-[250px]"
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
              onClick={handleSaveVoucher}
              className="w-full py-8 rounded-[3rem] text-white text-[14px] font-black uppercase tracking-[0.5em] shadow-[0_20px_40px_-15px_rgba(0,85,255,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(0,85,255,0.6)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-none"
              style={{ background: brand.primary_gradient, color: "#FFFFFF" }}
            >
              <MousePointerClick size={22} color="#FFFFFF" strokeWidth={3} />
              <span className="drop-shadow-sm">
                {isEditingVoucher
                  ? "Confirmă Actualizarea"
                  : "Lansează Voucherul în Rețea"}
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL CONFIGURARE BANNER EDITORIAL (GLOBAL + LOCAL SUPORT)
          ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
        <DialogContent className="max-w-[800px] w-[96vw] max-h-[90vh] p-0 rounded-[3.5rem] border-none shadow-2xl flex flex-col overflow-hidden bg-white [&>button]:hidden">
          <header className="px-8 md:px-12 py-8 flex justify-between items-center bg-white border-b border-zinc-100 shrink-0">
            <div>
              <DialogTitle
                className="text-3xl font-serif italic tracking-tight"
                style={{ color: "var(--brand-dark)" }}
              >
                {isEditingBanner
                  ? "Editează Bannerul"
                  : "Banner Nou de Campanie"}
              </DialogTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                Sistemul Editorial de Landing Page-uri
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-zinc-50 px-5 py-2.5 rounded-2xl border border-zinc-100">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                  Publicat
                </span>
                <button
                  onClick={() =>
                    setBannerFormData({
                      ...bannerFormData,
                      is_active: !bannerFormData.is_active,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative flex items-center px-1 shadow-inner ${bannerFormData.is_active ? "bg-emerald-500" : "bg-zinc-300"}`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: bannerFormData.is_active ? 24 : 0 }}
                  />
                </button>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="size-12 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 luxury-scrollbar bg-[#FAFAFA]">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase ml-2 text-zinc-500 tracking-widest">
                Targetare Afișare *
              </Label>
              <select
                className="w-full h-14 bg-white border border-zinc-200 rounded-2xl px-6 text-xs font-black uppercase outline-none shadow-sm focus:border-[var(--brand-primary)] transition-all"
                value={bannerFormData.category_id}
                onChange={(e) =>
                  setBannerFormData({
                    ...bannerFormData,
                    category_id: e.target.value,
                  })
                }
              >
                <option value="global_campaign_id">
                  🌍 CAMPANIE GLOBALĂ (TOT SITE-UL)
                </option>
                {categories.map((cat) => (
                  <optgroup label={cat.name} key={cat.id}>
                    <option value={cat.id}>Toată secțiunea {cat.name}</option>
                    {cat.subcategories?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        -- {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase ml-2 text-zinc-500 tracking-widest flex justify-between">
                  <span>Imagine Desktop (Landscape) *</span>
                </Label>
                <div className="p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm space-y-4">
                  <div className="aspect-[21/9] w-full bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-100 relative flex items-center justify-center">
                    {bannerFormData.image_desktop_url ? (
                      <img
                        src={bannerFormData.image_desktop_url}
                        alt="Desktop Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={30} className="text-zinc-300" />
                    )}
                  </div>
                  <input
                    className="w-full h-12 bg-zinc-50 rounded-xl px-4 text-[10px] font-medium outline-none border border-transparent focus:border-[var(--brand-primary)]/30"
                    placeholder="Introdu URL-ul imaginii (ex: https://...)"
                    value={bannerFormData.image_desktop_url}
                    onChange={(e) =>
                      setBannerFormData({
                        ...bannerFormData,
                        image_desktop_url: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase ml-2 text-zinc-500 tracking-widest">
                  Imagine Mobile (Portrait - Opțional)
                </Label>
                <div className="p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm space-y-4">
                  <div className="aspect-[4/5] w-[140px] mx-auto bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-100 relative flex items-center justify-center">
                    {bannerFormData.image_mobile_url ? (
                      <img
                        src={bannerFormData.image_mobile_url}
                        alt="Mobile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-zinc-300" />
                    )}
                  </div>
                  <input
                    className="w-full h-12 bg-zinc-50 rounded-xl px-4 text-[10px] font-medium outline-none border border-transparent focus:border-[var(--brand-primary)]/30"
                    placeholder="URL Mobile (dacă se lasă gol, folosește Desktop)"
                    value={bannerFormData.image_mobile_url}
                    onChange={(e) =>
                      setBannerFormData({
                        ...bannerFormData,
                        image_mobile_url: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase ml-2 text-zinc-500 tracking-widest">
                  Titlu Principal (Mare) *
                </Label>
                <input
                  className="w-full h-14 bg-zinc-50 rounded-2xl px-6 text-lg font-black uppercase outline-none focus:border focus:border-[var(--brand-primary)]/30"
                  placeholder="ex: SEASONAL SALE"
                  value={bannerFormData.title}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase ml-2 text-zinc-500 tracking-widest">
                    Subtitlu (Opțional)
                  </Label>
                  <input
                    className="w-full h-12 bg-zinc-50 rounded-xl px-5 text-xs font-bold outline-none focus:border focus:border-[var(--brand-primary)]/30"
                    placeholder="Până la -30% la selecția de geci."
                    value={bannerFormData.subtitle}
                    onChange={(e) =>
                      setBannerFormData({
                        ...bannerFormData,
                        subtitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase ml-2 text-zinc-500 tracking-widest">
                    Text Buton
                  </Label>
                  <input
                    className="w-full h-12 bg-zinc-50 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest outline-none focus:border focus:border-[var(--brand-primary)]/30"
                    placeholder="DESCOPERĂ COLECȚIA"
                    value={bannerFormData.button_text}
                    onChange={(e) =>
                      setBannerFormData({
                        ...bannerFormData,
                        button_text: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 md:px-12 py-8 bg-white border-t border-zinc-100 shrink-0">
            <button
              onClick={handleSaveBanner}
              className="w-full py-6 rounded-[2rem] text-white text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none"
              style={{ background: brand.primary_gradient }}
            >
              <LayoutTemplate size={18} />
              <span>
                {isEditingBanner ? "Salvează Modificările" : "Publică Bannerul"}
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
