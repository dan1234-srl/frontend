/**
 * AdminCoupons.tsx — Bento Neo-Mosaic (Futuristic + Theme Gradient KPIs)
 * Modul unificat pentru Vouchere (Cupoane Checkout) & Bannere Editoriale.
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
  ShoppingBag,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import {
  AdminDialogShell,
  AdminDialogTitle,
} from "@/components/admin/AdminDialogShell";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { readCache, writeCache } from "@/lib/swr-cache";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminCoupons = () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. STATE MANAGEMENT GLOBAL & TAB-URI
  // ─────────────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"VOUCHERS" | "BANNERS">(
    "VOUCHERS",
  );

  const cachedCats = readCache<any[]>("admin:coupons:categories", 120_000);
  const cachedBanners = readCache<any[]>("admin:coupons:banners", 60_000);
  const [categories, setCategories] = useState<any[]>(cachedCats.data || []);
  const [loading, setLoading] = useState(!cachedCats.data);

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
  const [banners, setBanners] = useState<any[]>(cachedBanners.data || []);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

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

  const bannerInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. API CONNECTIVITY
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const vKey = `admin:coupons:vouchers:${page}`;
    const vCached = readCache<any>(vKey, 60_000);
    if (vCached.data) {
      setCoupons(vCached.data.items || []);
      setTotalPages(vCached.data.pages || 1);
      setTotalItems(vCached.data.total || 0);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [vouchersRes, categoriesRes, bannersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/vouchers/admin?page=${page}&size=12`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/api/v1/categories/`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/v1/vouchers/admin/banners`, {
          credentials: "include",
        }),
      ]);

      if (vouchersRes.ok) {
        const vouchersData = await vouchersRes.json();
        setCoupons(vouchersData.items || []);
        setTotalPages(vouchersData.pages || 1);
        setTotalItems(vouchersData.total || 0);
        writeCache(vKey, vouchersData);
      }

      if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        setCategories(cats);
        writeCache("admin:coupons:categories", cats);
      }

      if (bannersRes.ok) {
        const bannersData = await bannersRes.json();
        setBanners(bannersData || []);
        writeCache("admin:coupons:banners", bannersData || []);
      }
    } catch (e) {
      if (!vCached.data) toast.error("Eroare de sincronizare cu baza de date.");
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
  // 3. HANDLERS VOUCHERE
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
  // 4. HANDLERS BANNERE EDITORIALE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Fișierul depășește limita admisă de 5MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      toast.loading("Generare automată versiuni responsive (WebP)...", {
        id: "banner-upload",
      });

      const res = await fetch(`${API_BASE_URL}/api/v1/images/banner`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Eroare pe serverul de procesare.");
      const data = await res.json();

      setBannerFormData((prev) => ({
        ...prev,
        image_desktop_url: data.desktop_url,
        image_mobile_url: data.mobile_url,
      }));

      toast.success("Banner optimizat cu succes pe toate rezoluțiile!", {
        id: "banner-upload",
      });
    } catch (err) {
      toast.error("Optimizarea imaginii a eșuat. Reîncercați.", {
        id: "banner-upload",
      });
    } finally {
      setUploadingImage(false);
    }
  };

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
        {
          method: "DELETE",
          credentials: "include",
        },
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
      return toast.error("Titlul și Imaginea sunt obligatorii.");
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
    if (!id || id === "global_campaign_id") return "🌍 CAMPANIE GLOBALĂ";
    const cat = categories.find((c) => c.id === id);
    if (cat) return cat.name;
    for (const mainCat of categories) {
      if (mainCat.subcategories) {
        const sub = mainCat.subcategories.find((s: any) => s.id === id);
        if (sub) return `${mainCat.name} > ${sub.name}`;
      }
    }
    return "Categorie Necunoscută";
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
              Revenue & Marketing Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Promo{" "}
            <span style={{ color: "var(--royal-violet)" }}>Architect</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div
            className="bg-white/60 backdrop-blur-xl border px-6 py-3 rounded-xl flex items-center gap-4 shadow-sm w-full sm:w-auto"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <Activity size={18} className="text-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">
                Puls Marketing
              </span>
              <span className="text-[11px] font-bold text-[var(--dark-amethyst)]">
                {totalItems} Vouchere | {banners.length} Bannere
              </span>
            </div>
          </div>

          <button
            onClick={
              activeTab === "VOUCHERS"
                ? handleOpenVoucherCreate
                : handleOpenBannerCreate
            }
            className="text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            {activeTab === "VOUCHERS" ? (
              <>
                <Plus size={14} strokeWidth={2.5} /> Generează Voucher
              </>
            ) : (
              <>
                <ImageIcon size={14} strokeWidth={2.5} /> Adaugă Banner
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── TAB-URI DE NAVIGARE (Glassmorphism) ──────────────────────────── */}
      <div
        className="flex items-center gap-2 bg-zinc-50/50 p-1.5 rounded-2xl w-fit border"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <button
          onClick={() => setActiveTab("VOUCHERS")}
          className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "VOUCHERS"
              ? "bg-white shadow-sm text-[var(--royal-violet)]"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          <Ticket size={14} /> Vouchere Checkout
        </button>
        <button
          onClick={() => setActiveTab("BANNERS")}
          className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "BANNERS"
              ? "bg-white shadow-sm text-[var(--royal-violet)]"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          <LayoutTemplate size={14} /> Bannere Editoriale
        </button>
      </div>

      {/* ── BENTO GRID ────────────────────────────────────────────────────── */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2
              className="animate-spin"
              size={32}
              style={{ color: "var(--royal-violet)" }}
            />
          </div>
        ) : activeTab === "VOUCHERS" ? (
          // GRID VOUCHERE
          coupons.length === 0 ? (
            <div
              className="py-32 flex flex-col items-center gap-3 bg-white/50 rounded-3xl border border-dashed"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <Ticket
                size={40}
                strokeWidth={1}
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                }}
              >
                Niciun voucher configurat
              </span>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {coupons.map((c) => {
                  const usage = c.usage_limit
                    ? Math.min(100, (c.times_used / c.usage_limit) * 100)
                    : 0;
                  return (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-white rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col shadow-sm"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                        style={{
                          background:
                            "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                        }}
                      />

                      <div
                        className="p-5 relative z-10 flex flex-col items-center text-center border-b"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                        }}
                      >
                        <span className="text-xl font-black uppercase tracking-tight text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
                          {c.code}
                        </span>
                        <span
                          className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase mt-2 border"
                          style={{
                            backgroundColor: c.is_active
                              ? "color-mix(in srgb, #10b981 5%, transparent)"
                              : "color-mix(in srgb, gray 5%, transparent)",
                            color: c.is_active ? "#10b981" : "gray",
                            borderColor: c.is_active
                              ? "color-mix(in srgb, #10b981 20%, transparent)"
                              : "color-mix(in srgb, gray 20%, transparent)",
                          }}
                        >
                          {c.is_active ? "Activ" : "Inactiv"}
                        </span>
                      </div>

                      <div className="p-5 flex-1 relative z-10 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                            <Percent size={12} /> Reducere
                          </span>
                          <span className="text-lg font-black text-[var(--dark-amethyst)]">
                            {c.discount_value}
                            {c.discount_type === "PERCENTAGE" ? "%" : " RON"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                            <ShoppingBag size={12} /> Comandă Min.
                          </span>
                          <span className="text-xs font-bold text-[var(--dark-amethyst)]">
                            {c.min_order_value > 0
                              ? `${c.min_order_value} RON`
                              : "0 RON"}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Utilizări</span>
                            <span style={{ color: "var(--royal-violet)" }}>
                              {c.times_used} / {c.usage_limit || "∞"}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${usage}%` }}
                              className="h-full rounded-full"
                              style={{ background: "var(--primary-gradient)" }}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className="px-4 py-2.5 border-t flex justify-between items-center relative z-10 bg-zinc-50/50 group-hover:bg-white/50 transition-colors mt-auto"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                        }}
                      >
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            toast.success("Copiat!");
                          }}
                          className="flex items-center gap-1.5 text-[9px] text-zinc-400 hover:text-[var(--royal-violet)] font-bold uppercase transition-colors"
                        >
                          <Copy size={10} /> Copiază
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenVoucherEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-[var(--royal-violet)] hover:text-white transition-colors text-[var(--dark-amethyst)]"
                            title="Editează"
                          >
                            <Edit3 size={12} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(c.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                            title="Șterge"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )
        ) : // GRID BANNERE
        banners.length === 0 ? (
          <div
            className="py-32 flex flex-col items-center gap-3 bg-white/50 rounded-3xl border border-dashed"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
            }}
          >
            <LayoutTemplate
              size={40}
              strokeWidth={1}
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
              }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
              }}
            >
              Niciun banner editorial
            </span>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {banners.map((b) => {
                const isGlobal = !b.category_id;
                return (
                  <motion.div
                    layout
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-white rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col shadow-sm"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <div className="h-40 w-full relative overflow-hidden bg-zinc-100">
                      <img
                        src={b.image_desktop_url}
                        alt="Banner"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/600x400?text=S3+Secure+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        {isGlobal ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-bold text-white bg-indigo-500/80 backdrop-blur-md uppercase tracking-widest border border-white/20 shadow-sm">
                            <Globe2 size={10} /> CAMPANIE GLOBALĂ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-bold text-white bg-zinc-900/80 backdrop-blur-md uppercase tracking-widest border border-white/20 shadow-sm">
                            {getCategoryName(b.category_id)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1 relative z-10 flex flex-col justify-center">
                      <span className="text-[14px] font-bold text-[var(--dark-amethyst)] uppercase tracking-tight line-clamp-1 group-hover:text-[var(--royal-violet)] transition-colors">
                        {b.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                        {b.subtitle || "Fără subtitlu"}
                      </span>
                    </div>

                    <div
                      className="px-5 py-3 border-t flex justify-between items-center relative z-10 bg-zinc-50/50 transition-colors mt-auto"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                      }}
                    >
                      <span
                        className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase border"
                        style={{
                          backgroundColor: b.is_active
                            ? "color-mix(in srgb, #10b981 5%, transparent)"
                            : "color-mix(in srgb, gray 5%, transparent)",
                          color: b.is_active ? "#10b981" : "gray",
                          borderColor: b.is_active
                            ? "color-mix(in srgb, #10b981 20%, transparent)"
                            : "color-mix(in srgb, gray 20%, transparent)",
                        }}
                      >
                        {b.is_active ? "Publicat" : "Ascuns"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenBannerEdit(b)}
                          className="p-1.5 rounded-lg hover:bg-[var(--royal-violet)] hover:text-white transition-colors text-[var(--dark-amethyst)]"
                          title="Editează"
                        >
                          <Edit3 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                          title="Șterge"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── PAGINATION (DOAR PENTRU VOUCHERE) ── */}
      {activeTab === "VOUCHERS" && !loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="hidden sm:flex gap-1.5">
            {[...Array(totalPages)]
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${page === i + 1 ? "text-white border-transparent" : "bg-white hover:bg-zinc-50"}`}
                  style={{
                    background:
                      page === i + 1 ? "var(--primary-gradient)" : undefined,
                    borderColor:
                      page !== i + 1
                        ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                        : undefined,
                    color: page !== i + 1 ? "var(--dark-amethyst)" : "white",
                  }}
                >
                  {i + 1}
                </button>
              ))
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
          </div>

          <span
            className="sm:hidden text-[10px] font-black uppercase tracking-[0.2em] bg-white border px-4 py-2 rounded-xl shadow-sm"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            {page} <span className="opacity-30 mx-1">/</span> {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronRight size={14} style={{ color: "var(--royal-violet)" }} />
          </button>
        </div>
      )}

      {/* ── MODAL CONFIGURARE VOUCHER ── */}
      <AdminDialogShell
        open={isVoucherModalOpen}
        onOpenChange={setIsVoucherModalOpen}
        size="xl"
        mobileVariant="modal"
        className="sm:h-[90vh] sm:max-h-[90vh] rounded-none sm:rounded-[2.5rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">
          Arhitectură Voucher
        </AdminDialogTitle>
        <header
          className="px-6 sm:px-10 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 flex justify-between items-center sticky top-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              {isEditingVoucher ? "Actualizare Voucher" : "Arhitectură Voucher"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck size={12} style={{ color: "var(--royal-violet)" }} />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Validare Securizată Server-Side
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="hidden sm:flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-xl border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <span
                className="text-[9px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Activare
              </span>
              <button
                onClick={() =>
                  setVoucherFormData({
                    ...voucherFormData,
                    is_active: !voucherFormData.is_active,
                  })
                }
                className={`w-10 h-5 rounded-full transition-all duration-300 relative flex items-center px-1 shadow-inner ${voucherFormData.is_active ? "bg-emerald-500" : "bg-zinc-300"}`}
              >
                <motion.div
                  layout
                  className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                  animate={{ x: voucherFormData.is_active ? 20 : 0 }}
                />
              </button>
            </div>
            <button
              onClick={() => setIsVoucherModalOpen(false)}
              className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 luxury-scrollbar relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-6"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-6"
                style={{ color: "var(--dark-amethyst)" }}
              >
                <Settings2 size={14} style={{ color: "var(--royal-violet)" }} />{" "}
                Identitate Promoțională
              </h3>
              <div className="space-y-2 group relative">
                <Label
                  className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Cod Unic (Public)
                </Label>
                <input
                  disabled={isEditingVoucher}
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xl font-black uppercase tracking-widest outline-none transition-all text-[var(--dark-amethyst)] disabled:opacity-50"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  value={voucherFormData.code}
                  placeholder="REDUCERE25"
                  onChange={(e) =>
                    setVoucherFormData({
                      ...voucherFormData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                  }}
                />
              </div>
              <div className="space-y-2 group relative">
                <Label
                  className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Mecanism Calcul
                </Label>
                <select
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xs font-black uppercase outline-none appearance-none cursor-pointer transition-all"
                  style={{
                    color: "var(--dark-amethyst)",
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  value={voucherFormData.discount_type}
                  onChange={(e) =>
                    setVoucherFormData({
                      ...voucherFormData,
                      discount_type: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                  }}
                >
                  <option value="PERCENTAGE">Procentual %</option>
                  <option value="FIXED_AMOUNT">Suma Fixă RON</option>
                </select>
              </div>
            </div>

            <div
              className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm flex flex-col items-center justify-center text-center space-y-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <div
                className="size-16 rounded-2xl flex items-center justify-center border shadow-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <Percent size={24} style={{ color: "var(--royal-violet)" }} />
              </div>
              <div className="space-y-1 w-full relative">
                <Label
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Valoare Reducere
                </Label>
                <input
                  type="number"
                  className="w-full text-center text-6xl sm:text-7xl font-serif italic font-black bg-transparent outline-none py-2"
                  style={{ color: "var(--dark-amethyst)" }}
                  value={voucherFormData.discount_value || ""}
                  placeholder="0"
                  onChange={(e) =>
                    setVoucherFormData({
                      ...voucherFormData,
                      discount_value: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <Label
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                <ShoppingBag size={14} /> Prag Comandă Min. (RON)
              </Label>
              <input
                type="number"
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xl font-black text-center outline-none transition-all text-[var(--dark-amethyst)]"
                style={{
                  boxShadow:
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                value={voucherFormData.min_order_value || ""}
                placeholder="0"
                onChange={(e) =>
                  setVoucherFormData({
                    ...voucherFormData,
                    min_order_value: Number(e.target.value),
                  })
                }
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                }}
              />
            </div>
            <div
              className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <Label
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                <Activity size={14} /> Limită Utilizări
              </Label>
              <input
                type="number"
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xl font-black text-center outline-none transition-all text-[var(--dark-amethyst)]"
                style={{
                  boxShadow:
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                value={voucherFormData.usage_limit || ""}
                placeholder="∞"
                onChange={(e) =>
                  setVoucherFormData({
                    ...voucherFormData,
                    usage_limit: Number(e.target.value),
                  })
                }
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
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

          <div
            className="p-6 sm:p-8 rounded-[1.5rem] flex flex-col justify-center space-y-4 shadow-xl"
            style={{ background: "var(--primary-gradient)" }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-white" />
              <h4 className="text-[11px] font-black uppercase text-white tracking-widest">
                Targetare Avansată
              </h4>
            </div>
            <p className="text-[10px] font-bold text-white/80 uppercase leading-relaxed">
              Dacă lași selecțiile goale, voucherul se va aplica GLOBAL pe
              întregul coș. Alege categorii sau produse pentru a crea oferte
              limitate (Ex: doar pe categoria Rochii).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <Label
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Alege Categoriile
              </Label>
              <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto luxury-scrollbar pr-2 pt-2">
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
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all ${active ? "text-white shadow-md border-transparent" : "bg-white hover:bg-zinc-50"}`}
                      style={{
                        background: active
                          ? "var(--primary-gradient)"
                          : undefined,
                        borderColor: !active
                          ? "color-mix(in srgb, var(--royal-violet) 15%, transparent)"
                          : undefined,
                        color: !active ? "var(--dark-amethyst)" : "white",
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <Label
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Fixare pe Articole Individuale
              </Label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  size={14}
                  style={{
                    color:
                      "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
                  }}
                />
                <input
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none transition-all text-[var(--dark-amethyst)]"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  placeholder="Caută în baza de date..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                  }}
                />
                <AnimatePresence>
                  {searchedProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-white shadow-2xl rounded-xl border z-50 overflow-hidden"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                    >
                      <div className="max-h-[200px] overflow-y-auto luxury-scrollbar">
                        {searchedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              toggleProductSelection(p);
                              setProductSearchTerm("");
                            }}
                            className="p-3 hover:bg-zinc-50 cursor-pointer flex items-center justify-between border-b last:border-none"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="size-10 bg-white rounded-lg overflow-hidden border shrink-0 p-1"
                                style={{
                                  borderColor:
                                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                }}
                              >
                                <img
                                  src={p.image_url || "/placeholder.png"}
                                  className="w-full h-full object-contain"
                                  alt=""
                                />
                              </div>
                              <span
                                className="text-[10px] font-bold uppercase tracking-tight line-clamp-1"
                                style={{ color: "var(--dark-amethyst)" }}
                              >
                                {p.name}
                              </span>
                            </div>
                            <div
                              className="p-1.5 rounded-md"
                              style={{
                                background:
                                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                                color: "var(--royal-violet)",
                              }}
                            >
                              <Plus size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="max-h-[150px] overflow-y-auto luxury-scrollbar space-y-2 pr-2">
                {selectedProductsData.length === 0 && (
                  <p
                    className="text-[9px] font-black uppercase tracking-widest text-center py-4"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                    }}
                  >
                    Nicio excepție adăugată
                  </p>
                )}
                {selectedProductsData.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-white p-2 rounded-lg border group"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <Package
                        size={12}
                        className="shrink-0"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                        }}
                      />
                      <span
                        className="text-[9px] font-bold uppercase truncate"
                        style={{ color: "var(--dark-amethyst)" }}
                      >
                        {p.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleProductSelection(p)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all shrink-0"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer
          className="p-5 sm:p-6 bg-white/90 backdrop-blur-xl border-t shrink-0 flex justify-end gap-3 sticky bottom-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            onClick={() => setIsVoucherModalOpen(false)}
            className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white border hover:bg-zinc-50 transition-all"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
            }}
          >
            Anulează
          </button>
          <button
            onClick={handleSaveVoucher}
            className="text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--primary-gradient)" }}
          >
            <MousePointerClick size={14} strokeWidth={2.5} />
            {isEditingVoucher ? "Salvează Modificări" : "Generează Voucher"}
          </button>
        </footer>
      </AdminDialogShell>

      {/* ── MODAL CONFIGURARE BANNER ── */}
      <AdminDialogShell
        open={isBannerModalOpen}
        onOpenChange={setIsBannerModalOpen}
        size="md"
        mobileVariant="modal"
        className="sm:h-[80vh] sm:max-h-[80vh] rounded-none sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">
          Configurare Banner
        </AdminDialogTitle>
        <header
          className="px-6 sm:px-8 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 sticky top-0 z-20 flex justify-between items-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              {isEditingBanner ? "Editează Banner" : "Banner Nou"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Sistem Editorial Landing Pages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-xl border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <span
                className="text-[8px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Afișare
              </span>
              <button
                onClick={() =>
                  setBannerFormData({
                    ...bannerFormData,
                    is_active: !bannerFormData.is_active,
                  })
                }
                className={`w-9 h-4.5 rounded-full transition-all duration-300 relative flex items-center px-1 shadow-inner ${bannerFormData.is_active ? "bg-emerald-500" : "bg-zinc-300"}`}
              >
                <motion.div
                  layout
                  className="w-3 h-3 bg-white rounded-full shadow-sm"
                  animate={{ x: bannerFormData.is_active ? 18 : 0 }}
                />
              </button>
            </div>
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 luxury-scrollbar relative z-10">
          <div
            className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-2 group relative"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <Label
              className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              Targetare Afișare *
            </Label>
            <select
              className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xs font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all"
              style={{
                color: "var(--dark-amethyst)",
                boxShadow:
                  "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
              value={bannerFormData.category_id}
              onChange={(e) =>
                setBannerFormData({
                  ...bannerFormData,
                  category_id: e.target.value,
                })
              }
              onFocus={(e) => {
                e.target.style.boxShadow =
                  "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                e.target.style.backgroundColor = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow =
                  "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
              }}
            >
              <option value="global_campaign_id">
                🌍 CAMPANIE GLOBALĂ (TOT SITE-UL)
              </option>
              {(categories || []).map((cat) => (
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

          <div
            className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-4"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <Label
              className="text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-2"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              <ImageIcon size={13} /> Imagine Campanie (Auto Desktop & Mobile) *
            </Label>
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleBannerUpload}
            />
            <div
              onClick={() => !uploadingImage && bannerInputRef.current?.click()}
              className="aspect-[21/7] w-full bg-white rounded-xl overflow-hidden border-2 border-dashed relative flex flex-col items-center justify-center gap-3 text-center p-6 cursor-pointer group transition-all"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2
                    size={24}
                    className="animate-spin"
                    style={{ color: "var(--royal-violet)" }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-wider"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                    }}
                  >
                    Se compilează variantele responsive...
                  </span>
                </div>
              ) : bannerFormData.image_desktop_url ? (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={bannerFormData.image_desktop_url}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/10">
                      <UploadCloud size={14} /> Schimbă imaginea
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud
                    size={28}
                    className="transition-colors group-hover:scale-110 duration-300"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                    }}
                  />
                  <div className="space-y-1">
                    <p
                      className="text-[10px] font-black uppercase tracking-wider"
                      style={{ color: "var(--dark-amethyst)" }}
                    >
                      Apasă pentru Upload
                    </p>
                    <p
                      className="text-[8px] font-medium"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                      }}
                    >
                      Sistemul va genera automat rezoluții optime pentru toate
                      device-urile.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-6"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div className="space-y-2 group relative">
              <Label
                className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Titlu Principal (Mare) *
              </Label>
              <input
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-black uppercase outline-none transition-all text-[var(--dark-amethyst)]"
                style={{
                  boxShadow:
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                placeholder="EX: SEASONAL SALE"
                value={bannerFormData.title}
                onChange={(e) =>
                  setBannerFormData({
                    ...bannerFormData,
                    title: e.target.value,
                  })
                }
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group relative">
                <Label
                  className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Subtitlu (Opțional)
                </Label>
                <input
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xs font-bold outline-none transition-all text-[var(--dark-amethyst)]"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  placeholder="Până la -30% la selecție."
                  value={bannerFormData.subtitle}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      subtitle: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                  }}
                />
              </div>
              <div className="space-y-2 group relative">
                <Label
                  className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Text Buton
                </Label>
                <input
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all text-[var(--dark-amethyst)]"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  placeholder="DESCOPERĂ COLECȚIA"
                  value={bannerFormData.button_text}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      button_text: e.target.value,
                    })
                  }
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
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
        </div>

        <footer
          className="p-5 sm:p-6 bg-white/90 backdrop-blur-xl border-t shrink-0 flex justify-end gap-3 sticky bottom-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            onClick={() => setIsBannerModalOpen(false)}
            className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white border hover:bg-zinc-50 transition-all"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
            }}
          >
            Anulează
          </button>
          <button
            onClick={handleSaveBanner}
            disabled={uploadingImage}
            className="text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--primary-gradient)" }}
          >
            <LayoutTemplate size={14} />
            {isEditingBanner ? "Salvează Modificări" : "Publică Bannerul"}
          </button>
        </footer>
      </AdminDialogShell>

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

export default AdminCoupons;
