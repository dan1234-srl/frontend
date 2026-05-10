import {
  Truck,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  CreditCard,
  Calendar,
  Package,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { LuxuryModal } from "@/components/ui/luxury-modal";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

export const OrderItem = ({ order }: any) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getValidImageUrl = (item: any) => {
    const source = item.product_image || item.product?.image_url;
    if (!source) return "/placeholder-jewelry.jpg";
    if (typeof source === "string" && source.startsWith("http")) return source;
    try {
      const parsed = typeof source === "string" ? JSON.parse(source) : source;
      return parsed?.main?.medium || parsed?.url || "/placeholder-jewelry.jpg";
    } catch {
      return "/placeholder-jewelry.jpg";
    }
  };

  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    toast.promise(
      async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
          { credentials: "include" },
        );
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Comanda-${order.order_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
      },
      {
        loading: "Generare document...",
        success: "Descărcat!",
        error: "Eroare la descărcare.",
      },
    );
  };

  // Logica pentru afișarea produselor (limitat la 3 + restul)
  const displayItems = order.items?.slice(0, 3) || [];
  const remainingCount = order.items?.length > 3 ? order.items.length - 3 : 0;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="relative bg-white border border-zinc-100 p-7 rounded-[2.5rem] shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full"
        style={{ isolation: "isolate" }} // Creează un nou stacking context fără a tăia marginile
      >
        {/* Bulina de Status - Plasată în afara fluxului normal pentru a preveni tăierea */}
        <div className="absolute -top-1 -left-1 z-50">
          <div className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-sm"></span>
          </div>
        </div>

        <div className="flex-1">
          <header className="flex justify-between items-start mb-10">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-1">
                Ref: {order.order_number?.split("-").pop()}
              </p>
              <h3 className="heading-serif text-2xl italic text-[var(--dark-amethyst)]">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
            <div className="bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-100">
              <p className="font-black text-sm text-[var(--dark-amethyst)]">
                {order.total_amount?.toLocaleString()}{" "}
                <span className="text-[10px] opacity-50">RON</span>
              </p>
            </div>
          </header>

          {/* Avatar Stacking System pentru Produse */}
          <div className="flex items-center mb-10 pl-2">
            <div className="flex -space-x-4">
              {displayItems.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, zIndex: 10, marginRight: "10px" }}
                  className="relative transition-all duration-300"
                >
                  <div className="size-16 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg bg-white">
                    <img
                      src={getValidImageUrl(item)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-black size-5 rounded-full flex items-center justify-center border-2 border-white">
                    {item.quantity}
                  </span>
                </motion.div>
              ))}

              {remainingCount > 0 && (
                <div className="size-16 rounded-[1.5rem] border-4 border-white shadow-lg bg-zinc-900 text-white flex flex-col items-center justify-center relative">
                  <Plus size={12} strokeWidth={3} />
                  <span className="text-[11px] font-black leading-none">
                    {remainingCount}
                  </span>
                </div>
              )}
            </div>
            <p className="ml-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic">
              {order.items?.length}{" "}
              {order.items?.length === 1 ? "Produs" : "Articole"}
            </p>
          </div>

          {/* Logistics Status */}
          <div className="space-y-4 mb-8 bg-zinc-50/50 p-5 rounded-[2rem] border border-zinc-100/50">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <span className="flex items-center gap-2">
                <Truck size={12} className="text-zinc-900" /> {order.status}
              </span>
              <span className="text-zinc-300">În curs</span>
            </div>
            <div className="flex gap-1.5 h-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 rounded-full ${s <= 2 ? "bg-zinc-900" : "bg-zinc-200"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-16 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-[0.98] shadow-xl"
        >
          Gestionare Comandă <ChevronRight size={14} />
        </button>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Arhiva Digitală"
        description={`Referință: ${order.order_number}`}
      >
        {/* MODAL FĂRĂ TRANSPARENȚĂ - Fundal alb solid */}
        <div
          className="space-y-10 py-4 bg-white text-left w-full"
          style={{ backgroundColor: "#ffffff", opacity: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2">
                <MapPin size={12} className="text-zinc-900" /> Adresa de Livrare
              </p>
              <p className="font-black text-base text-zinc-900">
                {order.customer_name}
              </p>
              <p className="text-xs text-zinc-500 italic mt-2 leading-relaxed">
                {(() => {
                  try {
                    const a =
                      typeof order.shipping_address === "string"
                        ? JSON.parse(order.shipping_address)
                        : order.shipping_address;
                    return `Strada ${a.street || ""}, ${a.city || ""}, ${a.county || ""}`;
                  } catch {
                    return String(order.shipping_address);
                  }
                })()}
              </p>
            </div>

            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-tighter">
                  Data Achiziției
                </span>
                <span className="font-bold">
                  {new Date(order.created_at).toLocaleDateString("ro-RO")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-tighter">
                  Modalitate Plată
                </span>
                <span className="font-bold uppercase tracking-tighter">
                  {order.payment_method}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[9px] font-black uppercase text-zinc-400 ml-2">
              Articolele tale
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-5 p-5 bg-white border border-zinc-100 rounded-[2rem] hover:shadow-md transition-all"
                >
                  <img
                    src={getValidImageUrl(item)}
                    className="size-16 rounded-2xl object-cover shadow-sm shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 truncate">
                      {item.product_name || "Bijuterie Evem"}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1">
                      Cantitate: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-sm text-zinc-900">
                    {item.price_at_purchase?.toLocaleString()} RON
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-8 bg-white">
            <button
              onClick={handleDownloadDocs}
              disabled={isDownloading}
              className="w-full sm:w-auto h-16 px-10 rounded-2xl border-2 border-zinc-900 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50"
            >
              <Download size={16} />
              Document Fiscal
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest mb-1">
                Total Final
              </p>
              <p className="heading-serif text-4xl font-bold text-zinc-900">
                {order.total_amount?.toLocaleString()} RON
              </p>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </>
  );
};
