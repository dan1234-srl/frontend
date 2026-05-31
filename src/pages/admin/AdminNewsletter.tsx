import { useState, useEffect } from "react";
import {
  Send,
  Users,
  MailOpen,
  Activity,
  Heart,
  Layout,
  Sparkles,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminNewsletter = () => {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaign">(
    "subscribers",
  );
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_active_users: 0 });

  // Stocăm template-urile create în Unlayer
  const [templates, setTemplates] = useState<any[]>([]);

  // Structura nouă a campaniei folosește ID-ul template-ului
  const [campaign, setCampaign] = useState({
    template_id: "",
    segment: "all",
    product_id: "",
  });

  // Fetch Statistici
  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/marketing/subscribers-count`,
        {
          // FĂRĂ HEADER-UL DE AUTHORIZATION
          headers: {
            "Content-Type": "application/json",
          },
          // DOAR ACESTA ESTE NECESAR PENTRU COOKIES
          credentials: "include",
        },
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401) {
        toast.error("Sesiunea a expirat sau nu ai drepturi de admin.");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch Template-uri din baza de date
  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/email-templates`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Filtrăm doar template-urile active
        setTemplates(data.filter((t: any) => t.is_active));
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

    if (campaign.segment === "wishlist_product" && !campaign.product_id) {
      return toast.error("Introdu ID-ul produsului pentru segmentul Wishlist.");
    }

    setLoading(true);
    try {
      // 🚀 Am eliminat citirea token-ului din localStorage
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/marketing/send-campaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 🚀 Am eliminat header-ul Authorization
          },
          // 🚀 credentials: "include" este suficient pentru a trimite cookie-ul automat
          credentials: "include",
          body: JSON.stringify(campaign),
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
    <div className="max-w-7xl mx-auto space-y-10 pb-16 text-left font-sans animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-white bg-black">
            <Activity size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-400">
            Marketing Automation
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-black">
              {activeTab === "subscribers" ? "Audiență" : "Campanie Nouă"}
            </h1>
          </div>

          <div className="flex p-1 bg-zinc-100 rounded-2xl">
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "subscribers" ? "bg-white shadow-sm text-black" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              Statistici
            </button>
            <button
              onClick={() => setActiveTab("campaign")}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "campaign" ? "bg-white shadow-sm text-black" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              Lansează Campanie
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "subscribers" ? (
          <motion.div
            key="subscribers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
                    Total Destinatari
                  </span>
                  <Users size={18} />
                </div>
                <h4 className="text-3xl font-serif italic tracking-tighter">
                  {stats.total_active_users}
                </h4>
                <p className="text-[8px] uppercase text-emerald-500 mt-2 font-bold tracking-widest">
                  Abonați Activi
                </p>
              </div>
            </div>

            <div className="bg-zinc-50/50 p-20 rounded-[3rem] border border-dashed border-zinc-200 text-center">
              <Mail size={40} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Alege template-ul creat în Unlayer și trimite oferte către cei{" "}
                {stats.total_active_users} abonați.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="campaign"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white border border-zinc-100 p-10 rounded-[3rem] shadow-xl space-y-8">
              {/* SELECTOR TEMPLATE UNLAYER */}
              <div className="space-y-4 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                  <Sparkles size={12} /> 1. Selectează Design-ul (Unlayer)
                </label>
                <select
                  value={campaign.template_id}
                  onChange={(e) =>
                    setCampaign({ ...campaign, template_id: e.target.value })
                  }
                  className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 text-sm font-bold outline-none focus:border-[var(--royal-violet)]"
                >
                  <option value="" disabled>
                    Alege un template salvat...
                  </option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} (Subiect: {t.subject})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400">
                  Dacă lista este goală, creează un design în secțiunea Email
                  Engine.
                </p>
              </div>

              {/* SELECTOR SEGMENT */}
              <div className="space-y-4 text-left pt-6 border-t border-zinc-100">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                  <Layout size={12} /> 2. Segmentare Audiență
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCampaign({ ...campaign, segment: "all" })}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all ${campaign.segment === "all" ? "border-[var(--royal-violet)] bg-purple-50/30" : "border-zinc-100 hover:border-zinc-200"}`}
                  >
                    <Users size={18} className="mb-2" />
                    <div className="font-bold text-xs uppercase tracking-widest">
                      Toți Utilizatorii
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-1">
                      Se trimite către toți cei {stats.total_active_users}{" "}
                      abonați.
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setCampaign({ ...campaign, segment: "wishlist_product" })
                    }
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all ${campaign.segment === "wishlist_product" ? "border-red-500 bg-red-50/30" : "border-zinc-100 hover:border-zinc-200"}`}
                  >
                    <Heart size={18} className="mb-2 text-red-500" />
                    <div className="font-bold text-xs uppercase tracking-widest">
                      Cei cu Wishlist
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-1">
                      Doar celor care și-au salvat un produs specific.
                    </div>
                  </button>
                </div>
              </div>

              {/* WISHLIST PRODUCT ID */}
              {campaign.segment === "wishlist_product" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 text-left"
                >
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    UUID Produs
                  </label>
                  <Input
                    placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
                    className="h-14 rounded-2xl font-mono text-xs"
                    value={campaign.product_id}
                    onChange={(e) =>
                      setCampaign({ ...campaign, product_id: e.target.value })
                    }
                  />
                </motion.div>
              )}

              {/* SEND BUTTON */}
              <div className="pt-6 border-t border-zinc-100">
                <Button
                  disabled={loading}
                  onClick={handleSendCampaign}
                  className="w-full h-16 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-2xl"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Lansează Campania
                </Button>
                <p className="text-[9px] text-zinc-400 mt-4 text-center uppercase tracking-widest font-medium italic">
                  Celery va procesa lista în background (cca. 10 email-uri /
                  secundă).
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
