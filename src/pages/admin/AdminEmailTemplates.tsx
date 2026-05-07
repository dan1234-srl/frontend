import { useState, useRef, useEffect } from "react";
import {
  Mail,
  Plus,
  ChevronLeft,
  Save,
  Activity,
  Loader2,
  Sparkles,
  X,
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

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminEmailTemplates = () => {
  const [view, setView] = useState<"list" | "presets" | "editor">("list");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const emailEditorRef = useRef<EditorRef>(null);
  const { theme } = useTheme();

  // Culori dinamice preluate direct din Context pentru motorul de email
  const brandColors = {
    deep: "var(--dark-amethyst)",
    accent: "var(--royal-violet)",
    soft: "var(--mauve-magic)",
    bg: "var(--background)",
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/email-templates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch error:", e);
      toast.error("Eroare la încărcarea template-urilor.");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

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
        toast.error("Eroare upload imagine");
        done({ progress: 0 });
      }
    });
  };

  const saveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer || !currentTemplate) return;

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
          toast.success("Design sincronizat!");
          fetchTemplates();
          setView("list");
        }
      } catch (e) {
        toast.error("Eroare la salvare.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="w-full h-full font-sans text-[var(--dark-amethyst)] text-left">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-10 space-y-10"
          >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10 border-zinc-100">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2"
                  style={{ color: "var(--royal-violet)" }}
                >
                  <Activity size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    System Notification Hub
                  </span>
                </div>
                <h1 className="heading-serif text-5xl md:text-6xl italic text-[var(--dark-amethyst)]">
                  Email{" "}
                  <span style={{ color: "var(--royal-violet)" }}>Engine</span>
                </h1>
              </div>
              <button
                onClick={() => openEditor()}
                className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl active:scale-95"
                style={{ background: "var(--primary-gradient)" }}
              >
                <Plus size={18} /> Design Nou
              </button>
            </header>

            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2
                  className="animate-spin"
                  style={{ color: "var(--royal-violet)" }}
                  size={40}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.isArray(templates) &&
                  templates.map((t: any) => (
                    <div
                      key={t.id || t.event_name}
                      className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
                      onClick={() => openEditor(t)}
                    >
                      <div className="flex justify-between mb-8">
                        <div className="size-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-[var(--dark-amethyst)] transition-all">
                          <Mail size={20} />
                        </div>
                        <Switch
                          checked={t.is_active}
                          className="data-[state=checked]:bg-[var(--royal-violet)]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
                        {t.title}
                      </h3>
                      <p
                        className="text-[10px] font-bold uppercase mt-1"
                        style={{ color: "var(--royal-violet)" }}
                      >
                        Trigger: {t.event_name}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        ) : view === "presets" ? (
          <motion.div
            key="presets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-10 space-y-10"
          >
            <header className="flex justify-between items-end border-b pb-10 border-zinc-100">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2"
                  style={{ color: "var(--royal-violet)" }}
                >
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Master Layouts
                  </span>
                </div>
                <h1 className="heading-serif text-4xl md:text-5xl italic text-[var(--dark-amethyst)]">
                  Puncte de plecare
                </h1>
                <p className="text-sm text-zinc-400 max-w-xl">
                  Toate preset-urile sunt deja stilizate cu paleta temei tale
                  active.
                </p>
              </div>
              <button
                onClick={() => setView("list")}
                className="size-12 grid place-items-center border border-zinc-200 hover:bg-zinc-50 transition-colors rounded-2xl"
              >
                <X size={18} />
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EMAIL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickPreset(p)}
                  className="text-left bg-white border border-zinc-100 p-8 rounded-[2rem] hover:shadow-2xl hover:border-[var(--royal-violet)]/30 transition-all group"
                >
                  <div className="flex justify-between mb-6">
                    <div className="size-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-[var(--royal-violet)] group-hover:text-white transition-all">
                      <Mail size={20} />
                    </div>
                    <span
                      className="text-[9px] font-black tracking-[0.3em] uppercase"
                      style={{ color: "var(--royal-violet)" }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <h3 className="heading-serif italic text-2xl text-[var(--dark-amethyst)] mb-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                  <p
                    className="text-[10px] font-mono mt-4 uppercase tracking-wider"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    {p.event_name}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <nav className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--dark-amethyst)]"
              >
                <ChevronLeft size={18} /> Revocă
              </button>

              <div className="flex flex-1 max-w-4xl mx-8 gap-4 overflow-x-auto no-scrollbar">
                <div className="min-w-[150px] flex-1">
                  <Label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">
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
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[var(--royal-violet)]"
                  />
                </div>
                <div className="min-w-[150px] flex-1">
                  <Label
                    className="text-[8px] font-black uppercase mb-1 block"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    Trigger Event
                  </Label>
                  <input
                    value={currentTemplate.event_name}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        event_name: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div className="min-w-[200px] flex-[2]">
                  <Label className="text-[8px] font-black uppercase text-zinc-400 mb-1 block">
                    Subject Line
                  </Label>
                  <input
                    value={currentTemplate.subject}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        subject: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[var(--royal-violet)]"
                  />
                </div>
              </div>

              <button
                onClick={saveTemplate}
                disabled={isSaving}
                className="text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 hover:brightness-110 disabled:bg-zinc-200 transition-all"
                style={{ background: "var(--primary-gradient)" }}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Save size={16} />
                )}
                Actualizează
              </button>
            </nav>

            <div className="flex-1 w-full relative bg-zinc-100">
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
                    trackingUrl: { name: "Link AWB", value: "{{trackingUrl}}" },
                  },
                }}
                style={{ height: "calc(100vh - 80px)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminEmailTemplates;
