import { useState, useEffect, useMemo } from "react";
import {
  Save,
  Loader2,
  Plus,
  Check,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  Wand2,
  PaintBucket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTheme, ThemeColors } from "@/contexts/ThemeContext";

const PALETTE_FIELDS: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: "dark_amethyst", label: "Deep (Base)" },
  { key: "dark_amethyst_2", label: "Deep 2" },
  { key: "indigo_ink", label: "Ink (Accent)" },
  { key: "indigo_velvet", label: "Velvet" },
  { key: "royal_violet", label: "Brand (Primary)" },
  { key: "lavender_purple", label: "Bright" },
  { key: "mauve_magic", label: "Soft" },
  { key: "mauve", label: "Softest" },
];

const AdminThemeSettings = () => {
  const {
    theme,
    themes,
    refreshLibrary,
    refreshTheme,
    applyTheme,
    saveTheme,
    deleteTheme,
    previewTheme,
    resetPreview,
  } = useTheme();

  const [formData, setFormData] = useState<Partial<ThemeColors>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [previewLive, setPreviewLive] = useState(true);
  const [loadingLib, setLoadingLib] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Încărcare inițială librărie
  useEffect(() => {
    refreshLibrary().finally(() => setLoadingLib(false));
  }, [refreshLibrary]);

  // Sincronizare inițială - se execută O SINGURĂ DATĂ când se încarcă tema activă primită de la backend
  useEffect(() => {
    if (theme && !isInitialized) {
      setFormData(theme);
      setEditingId(theme.id || null);
      setIsInitialized(true);
    }
  }, [theme, isInitialized]);

  // Cleanup Preview la părăsirea paginii
  useEffect(() => {
    return () => resetPreview();
  }, [resetPreview]);

  // --- GRADIENT LOGIC ---
  const autoGradientStart = (formData.dark_amethyst as string) || "#10002b";
  const autoGradientEnd =
    (formData.indigo_ink as string) ||
    (formData.royal_violet as string) ||
    "#3c096c";

  const { gradStart, gradEnd } = useMemo(() => {
    const gradStr = formData.primary_gradient;
    if (!gradStr)
      return { gradStart: autoGradientStart, gradEnd: autoGradientEnd };

    const hexMatch = gradStr.match(/#[a-fA-F0-9]{3,6}/g);
    if (hexMatch && hexMatch.length >= 2) {
      return { gradStart: hexMatch[0], gradEnd: hexMatch[1] };
    }
    return { gradStart: autoGradientStart, gradEnd: autoGradientEnd };
  }, [formData.primary_gradient, autoGradientStart, autoGradientEnd]);

  const activeGradient = useMemo(() => {
    return (
      formData.primary_gradient ||
      `linear-gradient(135deg, ${autoGradientStart} 0%, ${autoGradientEnd} 100%)`
    );
  }, [formData.primary_gradient, autoGradientStart, autoGradientEnd]);

  // Live preview controlat dinamic, fără să asculte de contextul global 'theme'
  useEffect(() => {
    if (previewLive && formData.royal_violet) {
      previewTheme({ ...formData, primary_gradient: activeGradient } as ThemeColors);
    }
  }, [formData, previewLive, activeGradient, previewTheme]);

  const handleField = (key: keyof ThemeColors, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const updateCustomGradient = (type: "start" | "end", val: string) => {
    const newStart = type === "start" ? val : gradStart;
    const newEnd = type === "end" ? val : gradEnd;
    handleField(
      "primary_gradient",
      `linear-gradient(135deg, ${newStart} 0%, ${newEnd} 100%)`
    );
  };

  const resetToAutoGradient = () => {
    handleField("primary_gradient", "");
    toast.success("Gradient resetat la modul automat");
  };

  const startEdit = (t: ThemeColors) => {
    setEditingId(t.id || null);
    setFormData(t);
    toast.info(`Configurăm: ${t.name}`);
  };

  const startNew = () => {
    setEditingId(null);
    if (theme) {
      const { id, slug, is_active, ...currentColors } = theme;
      setFormData({
        ...currentColors,
        name: `Varianta Nouă ${themes.length + 1}`,
        primary_gradient: "",
      });
    }
    toast.info("Am pregătit o pânză nouă bazată pe paleta curentă.");
  };

  const handleSave = async (asNew = false) => {
    if (!formData.name) return toast.error("Numele este obligatoriu");

    setIsSaving(true);
    try {
      const finalGradient =
        formData.primary_gradient ||
        `linear-gradient(135deg, ${autoGradientStart} 0%, ${autoGradientEnd} 100%)`;

      const payload = asNew
        ? {
            ...formData,
            primary_gradient: finalGradient,
            id: undefined,
            is_active: false,
            slug: undefined,
          }
        : { ...formData, primary_gradient: finalGradient };

      const targetId = asNew ? null : editingId;
      const saved = await saveTheme(payload, targetId);

      if (saved) {
        toast.success(
          asNew ? "Design salvat ca variantă nouă!" : "Identitate actualizată!"
        );
        setEditingId(saved.id);
        setFormData(saved);
        await refreshLibrary();

        if (saved.is_active) {
          previewTheme(saved);
          await refreshTheme();
        }
      }
    } catch (err) {
      toast.error("Eroare la salvare. Verificați datele.");
    } finaly {
      setIsSaving(false);
    }
  };

  const handleApply = async (themeId: string) => {
    setIsApplying(themeId);
    try {
      const ok = await applyTheme(themeId);
      if (ok) {
        toast.success("Tema a fost activată global!");
        const target = themes.find((t) => t.id === themeId);
        if (target) {
          previewTheme(target);
          setFormData(target);
          setEditingId(themeId);
        }
        await refreshLibrary();
        await refreshTheme();
      }
    } finaly {
      setIsApplying(null);
    }
  };

  const handleDelete = async (themeId: string) => {
    if (themeId === theme?.id)
      return toast.error("Nu poți șterge tema activă!");
    if (!window.confirm("Ștergi definitiv această identitate din sistem?"))
      return;

    setIsDeleting(themeId);
    try {
      const ok = await deleteTheme(themeId);
      if (ok) {
        toast.success("Design eliminat.");
        if (editingId === themeId) startNew();
        await refreshLibrary();
      }
    } finaly {
      setIsDeleting(null);
    }
  };

  if (loadingLib)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-zinc-900" size={40} />
      </div>
    );

  return (
    <div className="p-4 sm:p-10 space-y-12 max-w-[1700px] mx-auto animate-fade-in">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-1 w-10 bg-zinc-900 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Identity System
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-7xl text-foreground">
            Visual Studio
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setPreviewLive(!previewLive);
              previewLive ? resetPreview() : previewTheme(formData as ThemeColors);
            }}
            className={`flex items-center gap-2 px-6 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              previewLive
                ? "bg-zinc-900 text-white shadow-lg"
                : "bg-white text-zinc-400"
            }`}
          >
            {previewLive ? <Eye size={16} /> : <EyeOff size={16} />} Preview Live
          </button>
          <button
            onClick={startNew}
            className="h-14 px-8 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={18} /> Design Nou
          </button>
        </div>
      </header>

      {/* --- LIBRARY GRID --- */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        <AnimatePresence mode="popLayout">
          {themes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              isActive={!!t.is_active}
              isEditing={editingId === t.id}
              onEdit={() => startEdit(t)}
              onApply={() => handleApply(t.id!)}
              onDelete={() => handleDelete(t.id!)}
              isApplying={isApplying === t.id}
              isDeleting={isDeleting === t.id}
            />
          ))}
        </AnimatePresence>
      </section>

      {/* --- EDITOR & PREVIEW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* PANEL EDITARE */}
        <div className="lg:col-span-7 bg-white rounded-[3.5rem] border p-8 lg:p-12 shadow-xl shadow-zinc-200/40 space-y-12">
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleField("name", e.target.value)}
            className="text-4xl md:text-5xl font-serif bg-transparent border-b border-zinc-100 w-full focus:outline-none py-3 transition-all"
            placeholder="Ex: Sapphire Atelier..."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {PALETTE_FIELDS.map((f) => (
              <ColorInput
                key={f.key}
                label={f.label}
                value={(formData[f.key] as string) || "#000000"}
                onChange={(v: string) => handleField(f.key, v)}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <ColorInput
              label="Text Color"
              value={formData.text_primary || "#000"}
              onChange={(v: string) => handleField("text_primary", v)}
            />
            <ColorInput
              label="Surface BG"
              value={formData.surface_bg || "#fff"}
              onChange={(v: string) => handleField("surface_bg", v)}
            />
          </div>

          {/* GRADIENT BUILDER */}
          <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PaintBucket size={18} className="text-zinc-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                  Gradient Principal
                </h3>
              </div>
              <button
                onClick={resetToAutoGradient}
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900 hover:bg-zinc-200 px-4 py-2 rounded-full transition-all"
              >
                <Wand2 size={12} /> Auto (Din Bază)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ColorInput
                label="Start (Stânga-Sus)"
                value={gradStart}
                onChange={(v: string) => updateCustomGradient("start", v)}
              />
              <ColorInput
                label="Stop (Dreapta-Jos)"
                value={gradEnd}
                onChange={(v: string) => updateCustomGradient("end", v)}
              />
            </div>

            <div
              className="h-4 w-full rounded-full shadow-inner"
              style={{ background: activeGradient }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-zinc-50">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex-1 h-16 bg-zinc-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Check size={18} />
              )}{" "}
              Update Curentă
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex-1 h-16 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
            >
              <Sparkles size={18} /> Salvează ca Nouă
            </button>
          </div>
        </div>

        {/* PANEL PREVIEW */}
        <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-6">
          <div className="flex items-center justify-between px-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Simulation Environment
            </span>
            <div className="flex gap-2">
              <div className="size-2 rounded-full bg-zinc-200" />
              <div className="size-2 rounded-full bg-zinc-200" />
            </div>
          </div>

          <div
            className="rounded-[4.5rem] border overflow-hidden shadow-2xl transition-all duration-700"
            style={{ backgroundColor: formData.surface_bg || "#FBFBFD" }}
          >
            <div
              className="aspect-[16/11] relative flex items-center justify-center text-center text-white overflow-hidden"
              style={{ background: activeGradient }}
            >
              <div className="absolute inset-0 opacity-40">
                <div
                  className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[100px]"
                  style={{ background: formData.mauve_magic }}
                />
                <div
                  className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px]"
                  style={{ background: formData.lavender_purple }}
                />
              </div>
              <div className="z-10 space-y-6 px-10">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-80">
                  Linea Luxury
                </p>
                <h2 className="heading-serif text-5xl md:text-6xl">
                  Visual Identity
                </h2>
                <button className="h-14 px-10 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-zinc-900 shadow-2xl hover:scale-105 transition-transform">
                  Explore
                </button>
              </div>
            </div>

            <div className="p-14 space-y-12">
              <div className="flex justify-between items-end">
                <h4
                  className="heading-serif text-4xl"
                  style={{ color: formData.text_primary }}
                >
                  L'Atelier UI
                </h4>
                <div className="flex -space-x-2">
                  {[
                    formData.dark_amethyst,
                    formData.royal_violet,
                    formData.mauve,
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="size-10 rounded-full border-4 border-white shadow-md"
                      style={{ backgroundColor: c as string }}
                    />
                  ))}
                </div>
              </div>
              <button
                className="w-full h-18 rounded-[2rem] text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95"
                style={{ backgroundColor: formData.royal_violet }}
              >
                Primary Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const ColorInput = ({ label, value, onChange }: any) => (
  <div className="space-y-3 group">
    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">
      {label}
    </label>
    <div className="flex items-center gap-3 p-3 bg-white rounded-3xl border border-zinc-100 focus-within:border-zinc-300 transition-all shadow-sm">
      <div
        className="size-10 rounded-2xl border-4 border-zinc-50 shadow-sm shrink-0 relative overflow-hidden"
        style={{ backgroundColor: value || "#000000" }}
      >
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer scale-150"
        />
      </div>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none text-[11px] font-mono font-bold outline-none uppercase text-zinc-600 focus:text-zinc-900"
        placeholder="#HEX"
      />
    </div>
  </div>
);

const ThemeCard = ({
  theme,
  isActive,
  isEditing,
  onEdit,
  onApply,
  onDelete,
  isApplying,
  isDeleting,
}: any) => {
  const cardBg =
    theme.primary_gradient && theme.primary_gradient !== "NULL"
      ? theme.primary_gradient
      : `linear-gradient(135deg, ${theme.dark_amethyst || "#10002b"} 0%, ${theme.indigo_ink || theme.royal_violet || "#3c096c"} 100%)`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group aspect-[3/4.2] rounded-[3rem] border-2 transition-all relative overflow-hidden flex flex-col cursor-pointer ${
        isActive
          ? "border-zinc-900 shadow-xl"
          : isEditing
            ? "border-zinc-400 shadow-md"
            : "border-zinc-100 hover:border-zinc-300"
      }`}
      onClick={onEdit}
    >
      <div
        className="flex-1 transition-transform duration-700 group-hover:scale-110"
        style={{ background: cardBg }}
      >
        {isActive && (
          <div className="absolute top-5 right-5 size-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Check size={16} className="text-zinc-900" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="bg-white p-6 z-10 border-t border-zinc-50">
        <p className="text-[11px] font-black uppercase tracking-widest truncate text-zinc-900">
          {theme.name}
        </p>
      </div>
      <div className="absolute inset-0 bg-zinc-900/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 gap-3 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-full h-11 bg-white text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Configurare
        </button>
        {!isActive && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
              disabled={isApplying}
              className="w-full h-11 bg-white text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
            >
              {isApplying ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}{" "}
              Activare
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="w-full h-11 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}{" "}
              Șterge
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AdminThemeSettings;