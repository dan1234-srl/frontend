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
  Settings2,
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

  useEffect(() => {
    refreshLibrary().finally(() => setLoadingLib(false));
  }, [refreshLibrary]);

  useEffect(() => {
    if (theme && !isInitialized) {
      setFormData(theme);
      setEditingId(theme.id || null);
      setIsInitialized(true);
    }
  }, [theme, isInitialized]);

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

  useEffect(() => {
    if (previewLive && formData.royal_violet) {
      previewTheme({
        ...formData,
        primary_gradient: activeGradient,
      } as ThemeColors);
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
      `linear-gradient(135deg, ${newStart} 0%, ${newEnd} 100%)`,
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
        name: `Tema Nouă ${themes.length + 1}`,
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
          asNew ? "Design salvat ca variantă nouă!" : "Identitate actualizată!",
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
    } finally {
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
    } finally {
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
    } finally {
      setIsDeleting(null);
    }
  };

  if (loadingLib)
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1400px] mx-auto animate-fade-in font-sans">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 size={14} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              System Identity
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Visual Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPreviewLive(!previewLive);
              previewLive
                ? resetPreview()
                : previewTheme(formData as ThemeColors);
            }}
            className={`flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-semibold transition-all border ${
              previewLive
                ? "bg-zinc-900 text-white border-zinc-900 shadow-md hover:bg-zinc-800"
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {previewLive ? <Eye size={14} /> : <EyeOff size={14} />}
            Preview Live
          </button>
          <button
            onClick={startNew}
            className="h-10 px-5 bg-[var(--royal-violet)] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} /> Design Nou
          </button>
        </div>
      </header>

      {/* --- LIBRARY GRID --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* PANEL EDITARE */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-zinc-100 p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleField("name", e.target.value)}
              className="text-2xl font-bold bg-transparent border-b border-zinc-200 w-full focus:border-[var(--royal-violet)] outline-none py-2 transition-all placeholder:text-zinc-300 text-zinc-800"
              placeholder="Numele temei (ex. Cobalt Elegance)"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-800">
              Primary Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PALETTE_FIELDS.map((f) => (
                <ColorInput
                  key={f.key}
                  label={f.label}
                  value={(formData[f.key] as string) || "#000000"}
                  onChange={(v: string) => handleField(f.key, v)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-zinc-50">
            <h3 className="text-sm font-semibold text-zinc-800">
              Layout Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Text Primary"
                value={formData.text_primary || "#000"}
                onChange={(v: string) => handleField("text_primary", v)}
              />
              <ColorInput
                label="Surface Background"
                value={formData.surface_bg || "#fff"}
                onChange={(v: string) => handleField("surface_bg", v)}
              />
            </div>
          </div>

          {/* GRADIENT BUILDER */}
          <div className="p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-700">
                <PaintBucket size={16} className="text-zinc-400" />
                <h3 className="text-sm font-semibold">Brand Gradient</h3>
              </div>
              <button
                onClick={resetToAutoGradient}
                className="text-xs font-semibold flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <Wand2 size={12} /> Auto
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Start Color"
                value={gradStart}
                onChange={(v: string) => updateCustomGradient("start", v)}
              />
              <ColorInput
                label="End Color"
                value={gradEnd}
                onChange={(v: string) => updateCustomGradient("end", v)}
              />
            </div>

            <div
              className="h-6 w-full rounded-xl shadow-inner border border-black/5"
              style={{ background: activeGradient }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex-1 h-11 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-70 shadow-md"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              Salvează Modificări
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex-1 h-11 bg-white text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95 disabled:opacity-70 shadow-sm"
            >
              <Sparkles size={16} /> Salvează ca Nouă
            </button>
          </div>
        </div>

        {/* PANEL PREVIEW */}
        <div className="xl:col-span-5 xl:sticky xl:top-8">
          <div className="rounded-2xl border border-zinc-200 shadow-xl overflow-hidden bg-white">
            {/* Window Header (macOS style) */}
            <div className="bg-zinc-100/80 px-4 py-3 flex items-center gap-2 border-b border-zinc-200">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-rose-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="mx-auto text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2">
                Live Preview
              </span>
            </div>

            {/* App Mockup */}
            <div
              className="relative overflow-hidden transition-colors duration-500 min-h-[400px] flex flex-col"
              style={{ backgroundColor: formData.surface_bg || "#FBFBFD" }}
            >
              {/* Header Gradient Area */}
              <div
                className="h-32 relative flex items-center px-6 overflow-hidden"
                style={{ background: activeGradient }}
              >
                <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                  <div
                    className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl"
                    style={{ background: formData.mauve_magic }}
                  />
                  <div
                    className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl"
                    style={{ background: formData.lavender_purple }}
                  />
                </div>
                <div className="z-10 text-white">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">
                    Storefront
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Colecția Nouă
                  </h2>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h4
                    className="text-lg font-bold"
                    style={{ color: formData.text_primary }}
                  >
                    Produse Populare
                  </h4>
                  <div className="flex -space-x-1.5">
                    {[
                      formData.dark_amethyst,
                      formData.royal_violet,
                      formData.mauve,
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="size-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: c as string }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-xl border shadow-sm"
                    >
                      <div className="aspect-square bg-zinc-50 rounded-lg mb-3" />
                      <div className="h-2.5 w-2/3 bg-zinc-200 rounded-full mb-2" />
                      <div className="h-2 w-1/3 bg-zinc-100 rounded-full" />
                    </div>
                  ))}
                </div>

                <button
                  className="w-full h-11 mt-auto rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: formData.royal_violet }}
                >
                  Adaugă în coș
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const ColorInput = ({ label, value, onChange }: any) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-semibold text-zinc-500 ml-1">
      {label}
    </label>
    <div className="flex items-center gap-2 p-1.5 pr-3 bg-zinc-50 rounded-xl border border-zinc-200 focus-within:border-[var(--royal-violet)] focus-within:ring-1 focus-within:ring-[var(--royal-violet)] transition-all">
      <div
        className="size-7 rounded-lg shadow-inner shrink-0 relative overflow-hidden border border-black/5"
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
        className="flex-1 bg-transparent border-none text-xs font-mono font-medium outline-none uppercase text-zinc-700"
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group aspect-[4/3] rounded-2xl border transition-all relative overflow-hidden flex flex-col cursor-pointer bg-white ${
        isActive
          ? "border-zinc-900 shadow-lg ring-1 ring-zinc-900"
          : isEditing
            ? "border-zinc-400 shadow-md"
            : "border-zinc-200 hover:border-zinc-300 hover:shadow-md"
      }`}
      onClick={onEdit}
    >
      <div
        className="flex-1 w-full relative transition-transform duration-500 group-hover:scale-105"
        style={{ background: cardBg }}
      >
        {isActive && (
          <div className="absolute top-3 right-3 size-6 bg-white rounded-full flex items-center justify-center shadow-md">
            <Check size={12} className="text-zinc-900" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="p-3 border-t border-zinc-100 bg-white z-10">
        <p className="text-xs font-semibold text-zinc-800 truncate">
          {theme.name}
        </p>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 gap-2 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-full h-9 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
        >
          Editează
        </button>
        {!isActive && (
          <div className="flex gap-2 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
              disabled={isApplying}
              className="flex-1 h-9 bg-white text-zinc-900 border border-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-50 shadow-sm transition-colors"
            >
              {isApplying ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Activează
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="h-9 w-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center border border-rose-100 hover:bg-rose-500 hover:text-white transition-colors shrink-0"
            >
              {isDeleting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminThemeSettings;
