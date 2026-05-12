import { useState, useEffect } from "react";
import {
  Send,
  Users,
  MailOpen,
  MousePointer2,
  Search,
  Download,
  UserMinus,
  Mail,
  ChevronLeft,
  ChevronRight,
  Activity,
  Heart,
  Layout,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [searchTerm, setSearchTerm] = useState("");

  // State pentru campanie
  const [campaign, setCampaign] = useState({
    subject: "",
    content_html: "",
    segment: "all",
    product_id: "",
  });

  // 1. Fetch Statistici de la API
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/v1/marketing/subscribers-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 2. Apelare API pentru Trimitere Campanie
  const handleSendCampaign = async () => {
    if (!campaign.subject || !campaign.content_html) {
      return toast.error("Completează subiectul și conținutul email-ului.");
    }

    if (campaign.segment === "wishlist_product" && !campaign.product_id) {
      return toast.error("Introdu ID-ul produsului pentru segmentul Wishlist.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/v1/marketing/send-campaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(campaign),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Succes! Campania a fost programată pentru ${data.recipients_count} persoane.`,
        );
        setActiveTab("subscribers"); // Reset tab
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
      {/* HEADER DINAMIC */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-white bg-black">
            <Activity size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-400">
            Marketing Automation v2.0
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
              Configurare Email
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
            {/* STATS REAL-TIME */}
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
                  Utilizatori activi
                </p>
              </div>

              <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
                    Rată Deschidere
                  </span>
                  <MailOpen size={18} className="text-[var(--royal-violet)]" />
                </div>
                <h4 className="text-3xl font-serif italic tracking-tighter">
                  24.8%
                </h4>
                <p className="text-[8px] uppercase text-zinc-300 mt-2 font-bold tracking-widest">
                  Ultima campanie
                </p>
              </div>
            </div>

            {/* TABEL PLACEHOLDER - Aici poți implementa listarea utilizatorilor real-time */}
            <div className="bg-zinc-50/50 p-20 rounded-[3rem] border border-dashed border-zinc-200 text-center">
              <Mail size={40} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Selectează "Configurare Email" pentru a lansa o campanie către
                cei {stats.total_active_users} abonați.
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
              {/* SELECTOR SEGMENT */}
              <div className="space-y-4 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                  <Layout size={12} /> Segmentare Audiență
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCampaign({ ...campaign, segment: "all" })}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all ${campaign.segment === "all" ? "border-black bg-zinc-50" : "border-zinc-100"}`}
                  >
                    <Users size={18} className="mb-2" />
                    <div className="font-bold text-xs uppercase tracking-widest">
                      Toți Utilizatorii
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-1">
                      Se trimite către întreaga listă (
                      {stats.total_active_users})
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setCampaign({ ...campaign, segment: "wishlist_product" })
                    }
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all ${campaign.segment === "wishlist_product" ? "border-black bg-zinc-50" : "border-zinc-100"}`}
                  >
                    <Heart size={18} className="mb-2 text-red-500" />
                    <div className="font-bold text-xs uppercase tracking-widest">
                      Targetare Wishlist
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-1">
                      Doar celor care au produsul X salvat
                    </div>
                  </button>
                </div>
              </div>

              {/* PRODUCT ID (DOAR PENTRU WISHLIST) */}
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
                    placeholder="Introdu ID-ul produsului..."
                    className="h-14 rounded-2xl bg-red-50/20 border-red-100 font-mono text-xs"
                    value={campaign.product_id}
                    onChange={(e) =>
                      setCampaign({ ...campaign, product_id: e.target.value })
                    }
                  />
                </motion.div>
              )}

              {/* COMPOSE EMAIL */}
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Subiect Email
                  </label>
                  <Input
                    placeholder="ex: Reducere flash doar pentru tine..."
                    className="h-14 rounded-2xl bg-zinc-50 border-none font-bold"
                    value={campaign.subject}
                    onChange={(e) =>
                      setCampaign({ ...campaign, subject: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex justify-between">
                    Conținut (HTML suportat)
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Sparkles size={10} /> CSS Inline recomandat
                    </span>
                  </label>
                  <textarea
                    placeholder="Scrie conținutul campaniei aici..."
                    className="w-full h-80 bg-zinc-50 rounded-[2rem] p-6 text-sm font-mono border-none outline-none focus:ring-2 focus:ring-zinc-100 resize-none"
                    value={campaign.content_html}
                    onChange={(e) =>
                      setCampaign({ ...campaign, content_html: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* SEND BUTTON */}
              <div className="pt-6 border-t border-zinc-100">
                <Button
                  disabled={loading}
                  onClick={handleSendCampaign}
                  className="w-full h-16 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-2xl"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Lansează Campania în Worker
                </Button>
                <p className="text-[9px] text-zinc-400 mt-4 text-center uppercase tracking-widest font-medium italic">
                  Acțiunea va genera task-uri asincrone în coada Redis pentru
                  procesare imediată.
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
