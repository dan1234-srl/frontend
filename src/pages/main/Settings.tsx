import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {
  Bell,
  Globe,
  ShieldCheck,
  Moon,
  ArrowLeft,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Package,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const WebsiteSettings = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const handleSaveSettings = () => {
    toast.success("Preferințele au fost salvate cu succes.");
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: "Ștergi definitiv contul?",
      description:
        "Această acțiune este ireversibilă. Toate datele, comenzile și adresele tale vor fi șterse din sistemul Evem.",
      confirmLabel: "Șterge contul",
      cancelLabel: "Anulează",
      tone: "destructive",
    });
    if (ok) toast.error("Cererea de ștergere a fost înregistrată.");
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          {/* Buton Înapoi */}
          <button
            onClick={() => navigate("/account")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors group mb-12"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Înapoi la cont
          </button>

          {/* Header Arhitectural */}
          <header className="mb-16 pb-10 border-b border-zinc-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-brand" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand">
                Setări Sistem
              </p>
            </div>
            <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter italic">
              Preferințe <em>personale</em>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Coloana Stângă: Configurări Vizuale & Notificări */}
            <div className="lg:col-span-7 space-y-10">
              <Section icon={<Globe size={14} />} title="Localizare & Aspect">
                <Row
                  label="Limba Afișată"
                  description="Alege limba în care dorești să explorezi magazinul"
                  control={
                    <select className="bg-transparent border-b border-zinc-200 text-[10px] font-black uppercase tracking-widest py-2 outline-none focus:border-brand cursor-pointer">
                      <option>Română (RO)</option>
                      <option>English (EN)</option>
                    </select>
                  }
                />
                <Row
                  label="Monedă"
                  description="Prețurile vor fi convertite automat"
                  control={
                    <select className="bg-transparent border-b border-zinc-200 text-[10px] font-black uppercase tracking-widest py-2 outline-none focus:border-brand cursor-pointer">
                      <option>RON (L)</option>
                      <option>EUR (€)</option>
                      <option>USD ($)</option>
                    </select>
                  }
                />
                <Row
                  icon={<Moon size={14} strokeWidth={1.5} />}
                  label="Mod Întunecat"
                  description="Reduce oboseala vizuală în medii slab iluminate"
                  control={<Switch />}
                />
              </Section>

              <Section icon={<Bell size={14} />} title="Centru de Notificări">
                <Row
                  icon={<Package size={14} strokeWidth={1.5} />}
                  label="Status Comenzi"
                  description="Primește actualizări prin SMS și Email despre livrare"
                  control={<Switch defaultChecked />}
                />
                <Row
                  icon={<Mail size={14} strokeWidth={1.5} />}
                  label="Noutăți & Colecții"
                  description="Newsletter exclusiv pentru lansări private"
                  control={<Switch />}
                />
                <Row
                  icon={<Smartphone size={14} strokeWidth={1.5} />}
                  label="Alerte Stoc"
                  description="Anunță-mă când produsele favorite revin în stoc"
                  control={<Switch defaultChecked />}
                />
              </Section>
            </div>

            {/* Coloana Dreaptă: Securitate */}
            <div className="lg:col-span-5 space-y-8">
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-brand-deep text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
              >
                {/* Decor fundal */}
                <Lock className="absolute -right-4 -top-4 size-32 text-white/5" />

                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c77dfb] mb-10 flex items-center gap-3">
                  <ShieldCheck size={14} /> Securitate Cont
                </h3>

                <div className="space-y-8 relative z-10">
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-brand-softest/40 px-1">
                      Parola Actuală
                    </Label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-transparent border-b border-white/10 py-3 text-sm outline-none focus:border-brand transition-all pr-10 text-white font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                        type="button"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-brand-softest/40 px-1">
                      Parola Nouă
                    </Label>
                    <input
                      type="password"
                      className="w-full bg-transparent border-b border-white/10 py-3 text-sm outline-none focus:border-brand transition-all text-white font-medium"
                    />
                  </div>

                  <button className="w-full bg-white text-brand-deep text-[10px] font-black uppercase tracking-[0.3em] py-4 rounded-2xl hover:bg-brand-softest transition-colors shadow-lg">
                    Actualizează Parola
                  </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} className="text-[#c77dfb]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">
                        Autentificare 2FA
                      </p>
                      <p className="text-[10px] text-brand-softest/50 mt-2 leading-relaxed font-medium">
                        Adaugă un strat suplimentar de protecție folosind
                        telefonul tău.
                      </p>
                      <button className="text-[9px] font-black uppercase tracking-widest text-[#c77dfb] mt-4 underline underline-offset-8 hover:text-white transition-colors">
                        Configurează acum
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Zonă Periculoasă */}
              <div className="p-8 rounded-[2.5rem] border border-red-100 bg-red-50/30 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2">
                  Zonă Restricționată
                </p>
                <p className="text-[11px] text-zinc-500 mb-6 leading-relaxed font-medium">
                  Ștergerea contului va duce la pierderea definitivă a
                  istoricului de comenzi și a punctelor de loialitate.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="text-[10px] font-black uppercase tracking-widest text-red-600 underline underline-offset-8 hover:text-red-800"
                >
                  Șterge definitiv contul
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <button
              onClick={handleSaveSettings}
              className="px-20 h-16 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-black shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Salvează Modificările
            </button>
          </div>
        </div>
      </main>

      <Footer />
      {ConfirmDialog}
    </div>
  );
};

// Componente Interne pentru Organizare
const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-zinc-50/50 border border-zinc-100 p-10 rounded-[3rem] text-left"
  >
    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-10 pb-4 border-b border-zinc-100 flex items-center gap-3">
      {icon} {title}
    </h3>
    <div className="space-y-10">{children}</div>
  </motion.section>
);

const Row = ({
  icon,
  label,
  description,
  control,
}: {
  icon?: React.ReactNode;
  label: string;
  description: string;
  control: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
    <div className="flex items-start gap-4 min-w-0">
      {icon && <div className="text-brand mt-1 shrink-0">{icon}</div>}
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
          {label}
        </p>
        <p className="text-xs text-zinc-400 font-medium mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    <div className="shrink-0 w-full sm:w-auto flex justify-end">{control}</div>
  </div>
);

export default WebsiteSettings;
