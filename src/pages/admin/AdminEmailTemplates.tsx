/**
 * AdminEmailTemplates.tsx
 * Sistem Editorial Mail - Design Futuristic (Bento Neo-Mosaic & SWR Cache)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mail,
  Plus,
  ChevronLeft,
  Save,
  Activity,
  Loader2,
  Sparkles,
  X,
  Palette,
  Eye,
  FileCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { useTheme } from "@/contexts/ThemeContext";
import {
  EMAIL_PRESETS,
  buildPresetDesign,
  EmailPreset,
} from "@/lib/email-presets";
import { readCache, writeCache } from "@/lib/swr-cache";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const CACHE_KEY = "admin:email-templates";

const AdminEmailTemplates = () => {
  const [view, setView] = useState<"list" | "presets" | "editor">("list");
  const cachedTemplates = readCache<any[]>(CACHE_KEY, 120_000);
  const [templates, setTemplates] = useState<any[]>(cachedTemplates.data || []);
  const [loading, setLoading] = useState(!cachedTemplates.data);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const emailEditorRef = useRef<EditorRef>(null);
  const { theme } = useTheme();

  // Culori dinamice din sistemul Theme
  const brandColors = {
    deep: "var(--dark-amethyst)",
    accent: "var(--royal-violet)",
    soft: "var(--mauve-magic)",
    bg: "var(--background)",
  };

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/email-templates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setTemplates(arr);
      writeCache(CACHE_KEY, arr);
    } catch (e) {
      console.error("Fetch error:", e);
      if (!cachedTemplates.data)
        toast.error("Eroare la încărcarea layout-urilor.");
    } finally {
      setLoading(false);
    }
  }, [cachedTemplates.data]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openEditor = (template?: any) => {
    if (template) {
      setCurrentTemplate({ ...template });
      setView("editor");
    } else {
      setView("presets");
    }
  };

  const pickPreset = (preset: EmailPreset) => {
    setCurrentTemplate({
      title: preset.name,
      event_name: preset.event_name,
      subject: preset.subject,
      is_active: true,
      design_json: buildPresetDesign(preset.id, brandColors),
    });
    setView("editor");
  };

  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    if (currentTemplate?.design_json) {
      unlayer.loadDesign(currentTemplate.design_json);
    }

    unlayer.registerCallback("image", async (file: any, done: any) => {
      const formData = new FormData();
      formData.append("file", file.attachments[0]);
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/admin/email-templates/upload-image`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          },
        );
        const data = await res.json();
        done({ progress: 100, url: data.url });
      } catch (err) {
        toast.error("Eroare upload imagine pe server.");
        done({ progress: 0 });
      }
    });
  };

  const saveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer || !currentTemplate) return;

    if (!currentTemplate.title || !currentTemplate.event_name) {
      return toast.error("Numele intern și Trigger-ul sunt obligatorii.");
    }

    setIsSaving(true);
    unlayer.exportHtml(async (data) => {
      const { design, html } = data;
      const payload = {
        ...currentTemplate,
        design_json: design,
        html_body: html,
      };

      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/email-templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (res.ok) {
          toast.success("Design sincronizat cu succes în baza de date.");
          fetchTemplates();
          setView("list");
        } else {
          toast.error("Salvarea a eșuat. Verifică datele.");
        }
      } catch (e) {
        toast.error("Eroare la conexiunea cu serverul de campanii.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const toggleTemplateStatus = async (t: any) => {
    try {
      const updated = { ...t, is_active: !t.is_active };
      setTemplates(
        templates.map((temp) => (temp.id === t.id ? updated : temp)),
      );

      await fetch(`${API_BASE}/api/v1/admin/email-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
        credentials: "include",
      });
      toast.success("Status actualizat.");
    } catch (e) {
      toast.error("Eroare la schimbarea statusului.");
      fetchTemplates(); // rollback
    }
  };

  return (
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in relative z-0">
      <AnimatePresence mode="wait">
        {/* ─── VEDEREA 1: LISTA DE TEMPLATE-URI ──────────────────────── */}
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {/* Header */}
            <header
              className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pb-6 pt-4 border-b"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <Activity
                    size={12}
                    style={{ color: "var(--royal-violet)" }}
                    className="animate-pulse"
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.4em]"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 80%, black)",
                    }}
                  >
                    System Notification Hub
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
                  Email{" "}
                  <span style={{ color: "var(--royal-violet)" }}>Engine</span>
                </h1>
              </div>

              <div className="flex w-full lg:w-auto">
                <button
                  onClick={() => openEditor()}
                  className="w-full sm:w-auto text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <Plus size={14} strokeWidth={2.5} /> Design Nou (Blueprint)
                </button>
              </div>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-[2rem] p-8 space-y-4"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl animate-pulse" />
                      <div className="w-10 h-5 bg-zinc-100 rounded-full animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-zinc-100 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-zinc-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div
                className="py-32 flex flex-col items-center gap-3 bg-white/50 rounded-3xl border border-dashed"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                }}
              >
                <FileCode
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
                  Niciun template de mail configurat.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((t: any) => (
                  <div
                    key={t.id || t.event_name}
                    className="group relative bg-white border p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                    onClick={() => openEditor(t)}
                  >
                    {/* Background Hover Gradient */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                      }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className="size-14 bg-zinc-50 rounded-[1.2rem] flex items-center justify-center border shadow-inner group-hover:scale-105 transition-transform duration-500"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          <Mail
                            size={22}
                            style={{ color: "var(--royal-violet)" }}
                          />
                        </div>
                        <Switch
                          checked={t.is_active}
                          className="data-[state=checked]:bg-[var(--royal-violet)] scale-90"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTemplateStatus(t);
                          }}
                        />
                      </div>

                      <div className="flex-1 mt-2">
                        <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors truncate">
                          {t.title}
                        </h3>
                        <p
                          className="text-[10px] font-black uppercase mt-1 tracking-widest"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                          }}
                        >
                          Trigger: {t.event_name}
                        </p>
                      </div>

                      <div
                        className="mt-8 pt-4 border-t flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                        }}
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                          Deschide Editor
                        </span>
                        <div
                          className="size-8 rounded-full bg-white border flex items-center justify-center shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                            color: "var(--royal-violet)",
                          }}
                        >
                          <Eye size={12} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── VEDEREA 2: PRESETURI DE DESIGN ────────────────────────── */}
        {view === "presets" && (
          <motion.div
            key="presets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
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
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.4em]"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 80%, black)",
                    }}
                  >
                    Master Layouts
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
                  Puncte{" "}
                  <span style={{ color: "var(--royal-violet)" }}>
                    de plecare
                  </span>
                </h1>
                <p
                  className="text-xs font-bold pt-2"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                  }}
                >
                  Toate preset-urile au fost pre-stilizate cu paleta temei tale.
                </p>
              </div>

              <div className="flex w-full lg:w-auto">
                <button
                  onClick={() => setView("list")}
                  className="w-full sm:w-auto bg-white border px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-zinc-50"
                  style={{
                    color: "var(--dark-amethyst)",
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                >
                  <X size={14} strokeWidth={2.5} /> Închide Selecția
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EMAIL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickPreset(p)}
                  className="text-left bg-white border p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="size-14 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-[var(--royal-violet)] group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-md">
                      <Palette size={20} />
                    </div>
                    <span
                      className="text-[8px] font-black tracking-[0.3em] uppercase bg-zinc-50 px-3 py-1.5 rounded-md border"
                      style={{
                        color: "var(--royal-violet)",
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[var(--dark-amethyst)] mb-2 group-hover:text-[var(--royal-violet)] transition-colors">
                    {p.name}
                  </h3>
                  <p
                    className="text-[10px] font-bold leading-relaxed line-clamp-2"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                    }}
                  >
                    {p.description}
                  </p>
                  <div
                    className="mt-6 pt-4 border-t flex items-center"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                    }}
                  >
                    <p
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: "var(--dark-amethyst)" }}
                    >
                      <span className="opacity-50 mr-2">Trigger:</span>
                      {p.event_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── VEDEREA 3: EDITORUL COMPLET UNLAYER ────────────────────── */}
        {view === "editor" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Header Consolă pentru Editor (Aerisit și flexibil) */}
            <header
              className="w-full bg-white border-b flex flex-col lg:flex-row items-center justify-between px-6 py-4 gap-4 shrink-0 shadow-sm z-30"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-4">
                <button
                  onClick={() => setView("list")}
                  className="flex items-center justify-center size-12 rounded-full border bg-white hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all text-zinc-400 shrink-0"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  title="Renunță"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Input-urile au lățime flexibilă și spațiu generos */}
              <div className="flex flex-1 w-full lg:max-w-6xl xl:max-w-7xl mx-auto gap-4 overflow-x-auto luxury-scrollbar pb-2 lg:pb-0">
                <div className="min-w-[200px] flex-[1.5] group relative">
                  <Label
                    className="text-[9px] font-black uppercase ml-1 transition-colors"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                    }}
                  >
                    Nume Intern
                  </Label>
                  <input
                    value={currentTemplate.title}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-white/50 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)] mt-1.5 border"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--royal-violet)";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                      e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                    }}
                  />
                </div>

                <div className="min-w-[200px] flex-1 group relative">
                  <Label
                    className="text-[9px] font-black uppercase ml-1 transition-colors flex items-center gap-1.5"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    <Activity size={12} /> Trigger Event
                  </Label>
                  <input
                    value={currentTemplate.event_name}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        event_name: e.target.value,
                      })
                    }
                    className="w-full bg-white/50 rounded-xl px-4 py-3 text-sm font-mono font-bold outline-none transition-all text-[var(--dark-amethyst)] mt-1.5 border"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--royal-violet)";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                      e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                    }}
                  />
                </div>

                <div className="min-w-[300px] flex-[2.5] group relative">
                  <Label
                    className="text-[9px] font-black uppercase ml-1 transition-colors"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                    }}
                  >
                    Subiect Email (Public)
                  </Label>
                  <input
                    value={currentTemplate.subject}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        subject: e.target.value,
                      })
                    }
                    className="w-full bg-white/50 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)] mt-1.5 border"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--royal-violet)";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                      e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                    }}
                  />
                </div>
              </div>

              <div className="flex w-full lg:w-auto">
                <button
                  onClick={saveTemplate}
                  disabled={isSaving}
                  className="w-full sm:w-auto text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 hover:shadow-xl active:scale-95 disabled:opacity-50 transition-all shrink-0 whitespace-nowrap"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  Actualizează Design
                </button>
              </div>
            </header>

            {/* Email Editor Canvas */}
            <div className="flex-1 w-full relative bg-zinc-50 overflow-hidden">
              <EmailEditor
                ref={emailEditorRef}
                onReady={onReady}
                options={{
                  locale: "ro",
                  appearance: {
                    theme: "light",
                    panels: { tools: { dock: "left" } },
                  },
                  mergeTags: {
                    customerName: {
                      name: "Nume Client",
                      value: "{{customerName}}",
                    },
                    orderNumber: {
                      name: "Număr Comandă",
                      value: "{{orderNumber}}",
                    },
                    totalAmount: {
                      name: "Total Plată",
                      value: "{{totalAmount}}",
                    },
                    trackingUrl: {
                      name: "Link AWB (Curier)",
                      value: "{{trackingUrl}}",
                    },
                  },
                }}
                style={{ height: "100%", minHeight: "100%" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEmailTemplates;
