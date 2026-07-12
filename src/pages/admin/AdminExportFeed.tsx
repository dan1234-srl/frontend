import { useState } from "react";
import {
  DownloadCloud,
  Copy,
  ShieldCheck,
  RefreshCw,
  Send,
  Globe,
  Server,
  Activity,
  Database,
  CloudLightning,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminExportFeed = () => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Stocăm URL-urile publice (Blob) sau folosim un fallback către domeniu
  const [merchantUrl, setMerchantUrl] = useState(
    `${window.location.origin}/google-merchant.xml`,
  );
  const [sitemapUrl, setSitemapUrl] = useState(
    `${window.location.origin}/sitemap.xml`,
  );

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiat în clipboard!");
  };

  const handleGenerateFeeds = async () => {
    setGenerating(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE}/api/v1/export/admin/generate-feeds`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Fișierele au fost generate și salvate în cloud!");
        // Actualizăm input-urile cu noile link-uri permanente de pe Vercel Blob
        if (data.google_merchant_url) setMerchantUrl(data.google_merchant_url);
        if (data.sitemap_url) setSitemapUrl(data.sitemap_url);
      } else {
        toast.error(data.error || "Eroare la generarea fișierelor.");
      }
    } catch (error) {
      toast.error("Eroare de conexiune la server.");
    } finally {
      setGenerating(false);
    }
  };

  const pingSearchConsole = async () => {
    setLoadingGoogle(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/v1/export/ping-google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success(
          "Sitemap transmis cu succes către Google Search Console!",
        );
      } else {
        toast.error("Eroare la transmiterea cererii.");
      }
    } catch (error) {
      toast.error("Eroare de conexiune la server.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto animate-fade-in text-left">
      {/* HEADER DINAMIC */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="h-1 w-6 rounded-full"
              style={{ backgroundColor: "var(--royal-violet)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.4em]"
              style={{ color: "var(--royal-violet)" }}
            >
              SEO & Marketing Hub
            </span>
          </div>
          <h1 className="heading-serif text-4xl md:text-6xl text-[var(--dark-amethyst)]">
            Data Export <span className="italic font-light">Engine</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600">
            <Activity size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              System Online
            </span>
          </div>
          <button
            onClick={handleGenerateFeeds}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--dark-amethyst)] hover:brightness-110 text-white rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <CloudLightning size={14} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {generating ? "Se generează..." : "Manual Cloud Sync"}
            </span>
          </button>
        </div>
      </header>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* 1. GOOGLE MERCHANT */}
        <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4 mb-8">
            <div
              className="size-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--mauve)",
                color: "var(--royal-violet)",
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="heading-serif text-2xl text-[var(--dark-amethyst)]">
                Google Merchant
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Feed XML optimizat cu atribute extinse pentru campaniile Google
                Shopping Ads. Mapare dinamică stoc și prețuri reduse.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Public Blob URL
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={merchantUrl}
                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[10px] font-mono text-zinc-500 outline-none shadow-inner"
              />
              <button
                onClick={() => handleCopy(merchantUrl)}
                className="size-11 shrink-0 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
                style={{ background: "var(--primary-gradient)" }}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. SEO SITEMAP */}
        <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4 mb-8">
            <div className="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="heading-serif text-2xl text-[var(--dark-amethyst)]">
                Sitemap XML
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Harta completă a site-ului pentru indexarea prioritară în Google
                Search Console. Notificare automată crawler.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Public Blob URL
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={sitemapUrl}
                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[10px] font-mono text-zinc-500 outline-none shadow-inner"
              />
              <button
                onClick={() => handleCopy(sitemapUrl)}
                className="size-11 shrink-0 bg-white border border-zinc-200 hover:border-[var(--royal-violet)] text-[var(--dark-amethyst)] rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                <Copy size={16} />
              </button>
            </div>
            <button
              onClick={pingSearchConsole}
              disabled={loadingGoogle}
              className="w-full h-11 mt-2 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingGoogle ? (
                <RefreshCw className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
              Ping Google Indexer
            </button>
          </div>
        </div>

        {/* 3. CSV EXPORT */}
        <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4 mb-8">
            <div
              className="size-14 rounded-2xl text-white flex items-center justify-center shadow-lg"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Database size={24} />
            </div>
            <div>
              <h3 className="heading-serif text-2xl text-[var(--dark-amethyst)]">
                CSV Inventory
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Export tabelar complet pentru Facebook Meta Catalog sau analiza
                stocurilor B2B.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Direct Data Download
            </label>
            <a
              href={`${API_BASE}/api/v1/export/catalog.csv`}
              download
              className="w-full h-11 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl hover:brightness-110"
              style={{ background: "var(--dark-amethyst)" }}
            >
              <DownloadCloud size={16} /> Descarcă CSV Master
            </a>
          </div>
        </div>
      </div>

      {/* SYSTEM LOGS */}
      <section className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-3 mb-6">
          <Server size={16} className="text-zinc-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Export Engine Status & Dynamic Sync
          </h3>
        </div>
        <div className="space-y-3">
          {[
            { s: "Vercel Blob Storage", t: "Static XML Hosting", d: "12ms" },
            {
              s: "Search Console Connector",
              t: "Real-time Sitemap Ping",
              d: "0.2ms",
            },
            {
              s: "Meta Catalog (Facebook)",
              t: "On-demand CSV",
              d: "Real-time",
            },
          ].map((log, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-zinc-100 rounded-2xl gap-4"
            >
              <div>
                <p className="text-sm font-bold text-[var(--dark-amethyst)] uppercase tracking-tight">
                  {log.s}
                </p>
                <p
                  className="text-[10px] uppercase tracking-widest mt-1"
                  style={{ color: "var(--royal-violet)" }}
                >
                  {log.t}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black uppercase text-zinc-300">
                    Latency
                  </p>
                  <p className="text-xs font-mono font-bold text-[var(--dark-amethyst)]">
                    {log.d}
                  </p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black uppercase text-emerald-600 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Active
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER BANNER DINAMIC */}
      <footer
        className="p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
        style={{ background: "var(--primary-gradient)" }}
      >
        <div className="relative z-10 space-y-2">
          <h4 className="heading-serif text-3xl italic">
            Automated Distribution
          </h4>
          <p className="text-sm opacity-80 font-medium">
            Sistemul actualizează feed-urile direct în Cloud pentru a garanta
            performanță maximă (Zero Timeout).
          </p>
        </div>
        <div className="relative z-10 flex gap-4">
          <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase font-black opacity-60">
              Vercel Edge Network
            </p>
            <p className="text-xs font-bold uppercase tracking-widest">Live</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
      </footer>
    </div>
  );
};

export default AdminExportFeed;
