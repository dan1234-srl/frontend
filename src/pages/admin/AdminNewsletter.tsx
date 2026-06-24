/**
 * AdminNewsletter.tsx
 * Sistem Lansare Campanii Marketing - Design Futuristic (Bento Neo-Mosaic & SWR Cache)
 */

import { useState, useEffect } from "react";
import {
  Send,
  Users,
  Activity,
  Layout,
  Sparkles,
  Loader2,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { readCache, writeCache } from "@/lib/swr-cache";
import { Label } from "@/components/ui/label";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminNewsletter = () => {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaign">(
    "subscribers",
  );
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(
    readCache<{ total_active_users: number }>("admin:newsletter:stats", 60_000)
      .data || { total_active_users: 0 },
  );

  const [templates, setTemplates] = useState<any[]>(
    readCache<any[]>("admin:newsletter:templates", 60_000).data || [],
  );

  const [campaign, setCampaign] = useState({
    template_id: "",
    segment: "all",
    product_id: "",
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/marketing/subscribers-count`,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        writeCache("admin:newsletter:stats", data);
      } else if (res.status === 401) {
        toast.error("Sesiunea a expirat sau nu ai drepturi de admin.");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const active = data.filter((t: any) => t.is_active);
        setTemplates(active);
        writeCache("admin:newsletter:templates", active);
      }
    } catch (error) {
      toast.error("Eroare la încărcarea template-urilor.");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTemplates();
  }, []);

  const handleSendCampaign = async () => {
    if (!campaign.template_id) {
      return toast.error(
        "Te rugăm să selectezi un design (Template) pentru email.",
      );
    }

    setLoading(true);

    // 🚀 FIX: Curățăm payload-ul. Pydantic (UUID) acceptă null, dar nu acceptă string gol "".
    const payload = {
      template_id: campaign.template_id,
      segment: campaign.segment,
      product_id: campaign.product_id === "" ? null : campaign.product_id,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/marketing/send-campaign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload), // Trimitem payload-ul curățat
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Succes! Campania se trimite către ${data.recipients_count} abonați.`,
        );
        setActiveTab("subscribers");
      } else {
        toast.error(data.detail || "Eroare la trimiterea campaniei.");
      }
    } catch (error) {
      toast.error("Eroare de conexiune cu serverul.");
    } finally {
      setLoading(false);
    }
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
            <Activity
              size={12}
              className="animate-pulse"
              style={{ color: "var(--royal-violet)" }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              Marketing Automation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            {activeTab === "subscribers" ? "Performanță" : "Campanie Nouă"}
          </h1>
        </div>

        {/* TAB-URI DE NAVIGARE (Glassmorphism) */}
        <div
          className="flex items-center gap-2 bg-zinc-50/50 p-1.5 rounded-2xl w-fit border"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            onClick={() => setActiveTab("subscribers")}
            className="relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            style={{
              color:
                activeTab === "subscribers"
                  ? "var(--royal-violet)"
                  : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
            }}
          >
            {activeTab === "subscribers" && (
              <motion.div
                layoutId="newsletter-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Users size={14} /> Audiență
            </span>
          </button>

          <button
            onClick={() => setActiveTab("campaign")}
            className="relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            style={{
              color:
                activeTab === "campaign"
                  ? "var(--royal-violet)"
                  : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
            }}
          >
            {activeTab === "campaign" && (
              <motion.div
                layoutId="newsletter-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Zap size={14} /> Lansează
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "subscribers" ? (
          <motion.div
            key="subscribers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Audiență */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div
                className="relative overflow-hidden rounded-[20px] p-6 shadow-lg shadow-black/[0.04] group border border-white/10"
                style={{ background: "var(--primary-gradient)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 text-white shadow-sm w-fit transition-transform group-hover:scale-105">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70 mb-1">
                      Abonați Activi (Bază Date)
                    </p>
                    <h4 className="heading-serif text-3xl sm:text-[40px] tracking-tight text-white font-medium leading-none drop-shadow-sm">
                      {stats.total_active_users}
                    </h4>
                  </div>
                </div>
                <div
                  aria-hidden
                  className="absolute -right-6 -bottom-6 size-28 rounded-full pointer-events-none mix-blend-overlay transition-transform duration-700 group-hover:scale-150"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    filter: "blur(20px)",
                  }}
                />
              </div>
            </div>

            {/* Empty State Banner */}
            <div
              className="bg-white/60 backdrop-blur-md p-16 md:p-24 rounded-[3rem] border border-dashed text-center shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <div
                className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <Mail size={32} style={{ color: "var(--royal-violet)" }} />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--dark-amethyst)] mb-3">
                Pregătește o nouă campanie
              </h3>
              <p
                className="text-[10px] font-black uppercase tracking-widest max-w-lg mx-auto leading-relaxed"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                }}
              >
                Alege template-ul creat în Unlayer (Email Engine) și trimite
                noutăți, oferte și comunicate de presă către toți cei{" "}
                {stats.total_active_users} abonați ai brandului.
              </p>
              <button
                onClick={() => setActiveTab("campaign")}
                className="mt-8 px-8 py-3.5 bg-white border rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-zinc-50 shadow-sm"
                style={{
                  color: "var(--dark-amethyst)",
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
              >
                Configurează Lansarea
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="campaign"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              className="bg-white/80 backdrop-blur-xl border p-8 sm:p-12 rounded-[2.5rem] shadow-xl space-y-10"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              {/* SELECTOR TEMPLATE UNLAYER */}
              <div className="space-y-4 text-left">
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                  style={{ color: "var(--royal-violet)" }}
                >
                  <Sparkles size={14} /> 1. Selectează Design-ul Master
                </Label>
                <div className="relative">
                  <select
                    value={campaign.template_id}
                    onChange={(e) =>
                      setCampaign({ ...campaign, template_id: e.target.value })
                    }
                    className="w-full h-16 bg-white/50 backdrop-blur-sm border rounded-2xl px-6 text-xs font-bold outline-none transition-all appearance-none cursor-pointer"
                    style={{
                      color: "var(--dark-amethyst)",
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow =
                        "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow =
                        "inset 0 2px 4px 0 rgba(0,0,0,0.02)";
                      e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                    }}
                  >
                    <option value="" disabled>
                      Alege un template salvat din Email Engine...
                    </option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} (Subiect: {t.subject})
                      </option>
                    ))}
                  </select>
                </div>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest italic"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                  }}
                >
                  Dacă lista este goală, creează un design în secțiunea Email
                  Engine. Doar cele marcate cu "LIVE" vor apărea aici.
                </p>
              </div>

              {/* SELECTOR SEGMENT */}
              <div
                className="space-y-6 text-left pt-8 border-t"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                }}
              >
                <Label
                  className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                  style={{ color: "var(--royal-violet)" }}
                >
                  <Layout size={14} /> 2. Segmentare Audiență
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCampaign({ ...campaign, segment: "all" })}
                    className="p-6 sm:p-8 rounded-[2rem] border text-left transition-all relative overflow-hidden group"
                    style={{
                      borderColor:
                        campaign.segment === "all"
                          ? "transparent"
                          : "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      background:
                        campaign.segment === "all"
                          ? "var(--primary-gradient)"
                          : "transparent",
                    }}
                  >
                    {campaign.segment === "all" && (
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <Users
                      size={20}
                      className="mb-4"
                      style={{
                        color:
                          campaign.segment === "all"
                            ? "white"
                            : "var(--royal-violet)",
                      }}
                    />
                    <div
                      className={`font-black text-sm uppercase tracking-widest ${campaign.segment === "all" ? "text-white" : "text-[var(--dark-amethyst)]"}`}
                    >
                      Toți Utilizatorii
                    </div>
                    <div
                      className={`text-[10px] mt-2 font-bold leading-relaxed ${campaign.segment === "all" ? "text-white/70" : "text-zinc-500"}`}
                    >
                      Se trimite către toți cei {stats.total_active_users}{" "}
                      abonați activi din baza de date. Ideal pentru Newslettere
                      Generale.
                    </div>
                  </button>
                </div>
              </div>

              {/* SEND BUTTON */}
              <div
                className="pt-8 border-t flex flex-col items-center"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                }}
              >
                <button
                  disabled={loading}
                  onClick={handleSendCampaign}
                  className="w-full sm:w-auto px-12 py-5 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} strokeWidth={2.5} />
                  )}
                  Lansează Campania
                </button>
                <p
                  className="text-[9px] mt-6 text-center uppercase tracking-widest font-black italic flex items-center gap-2"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                  }}
                >
                  <Activity size={12} /> Sistemul de background Celery va
                  procesa lista (cca. 10 email-uri / secundă).
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNewsletter;
