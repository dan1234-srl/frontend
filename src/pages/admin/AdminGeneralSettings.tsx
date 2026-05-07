import { Globe, CreditCard, Activity, Bell, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const AdminGeneralSettings = () => {
  return (
    <div className="space-y-10 pb-16 text-left font-sans animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-8">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg text-white shadow-lg"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Activity size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--royal-violet)]">
            Configurare Sistem Master
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter text-[var(--dark-amethyst)]">
          Setări Generale
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regional */}
        <section className="bg-white border border-zinc-100 p-8 md:p-10 shadow-sm rounded-[2rem] space-y-8">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-[var(--dark-amethyst)] flex items-center gap-3 pb-4 border-b border-zinc-50">
            <Globe size={18} className="text-[var(--royal-violet)]" /> Regional
            & Monedă
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-black ml-1">
                Țara Magazinului
              </label>
              <select className="w-full bg-zinc-50 border-none rounded-xl h-12 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all appearance-none text-[var(--dark-amethyst)]">
                <option>România</option>
                <option>Uniunea Europeană</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-black ml-1">
                Monedă Implicită
              </label>
              <select className="w-full bg-zinc-50 border-none rounded-xl h-12 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all appearance-none text-[var(--dark-amethyst)]">
                <option>RON (Lei)</option>
                <option>EUR (Euro)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Payments */}
        <section
          className="text-white p-8 md:p-10 shadow-2xl rounded-[2rem] space-y-8 relative overflow-hidden"
          style={{ background: "var(--dark-amethyst)" }}
        >
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black opacity-40 flex items-center gap-3 pb-4 border-b border-white/5">
            <CreditCard size={18} /> Procesatori Plăți
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black tracking-widest">
                  Stripe Gateway
                </span>
                <span className="text-[9px] opacity-50 uppercase">
                  Card Bancar (Mastercard/Visa)
                </span>
              </div>
              <span className="text-[9px] px-3 py-1 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-full shadow-lg">
                Conectat
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-40">
              <span className="text-[10px] uppercase font-black tracking-widest">
                Netopia Payments
              </span>
              <button className="text-[10px] font-black uppercase underline underline-offset-8 decoration-[var(--royal-violet)]">
                Configurează
              </button>
            </div>
          </div>
          {/* Decorator fundal */}
          <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full blur-3xl" />
        </section>

        {/* Notifications */}
        <section className="bg-white border border-zinc-100 p-8 md:p-10 shadow-sm rounded-[2rem] space-y-8">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-[var(--dark-amethyst)] flex items-center gap-3 pb-4 border-b border-zinc-50">
            <Bell size={18} className="text-[var(--royal-violet)]" /> Notificări
            Automate
          </h3>
          <div className="space-y-6">
            {[
              { label: "Email la comandă nouă", active: true },
              { label: "Email la recenzie nouă", active: false },
              { label: "Alertă stoc redus", active: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-[var(--dark-amethyst)] transition-colors">
                  {item.label}
                </span>
                <Switch
                  defaultChecked={item.active}
                  className="data-[state=checked]:bg-[var(--dark-amethyst)]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="bg-white border border-zinc-100 p-8 md:p-10 shadow-sm rounded-[2rem] space-y-8">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-[var(--dark-amethyst)] flex items-center gap-3 pb-4 border-b border-zinc-50">
            <Shield size={18} className="text-[var(--royal-violet)]" />{" "}
            Securitate & Acces
          </h3>
          <div className="space-y-6">
            {[
              { label: "Autentificare 2FA", active: false },
              { label: "Sesiuni active vizibile", active: true },
              { label: "Blocare la 5 încercări eșuate", active: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-[var(--dark-amethyst)] transition-colors">
                  {item.label}
                </span>
                <Switch
                  defaultChecked={item.active}
                  className="data-[state=checked]:bg-[var(--dark-amethyst)]"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminGeneralSettings;
