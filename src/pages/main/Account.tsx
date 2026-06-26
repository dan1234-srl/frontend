import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { LuxuryModal } from "@/components/ui/luxury-modal";
import { QRCodeSVG } from "qrcode.react";
import {
  Phone,
  Calendar,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  LogOut,
  ChevronRight,
  Fingerprint,
  Mail,
  Camera,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AccountProfile = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [activating2FA, setActivating2FA] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      toast.error("Vă rugăm să vă autentificați.");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // LOGICĂ 2FA
  const handleSetup2FA = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/setup`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setQrUrl(data.otpauth_url);
        setShow2FAModal(true);
      } else {
        toast.error("Eroare la generarea codului.");
      }
    } catch {
      toast.error("Eroare de rețea.");
    }
  };

  const handleConfirm2FA = async () => {
    if (twoFactorCode.length < 6) return;
    setActivating2FA(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/2fa/enable?code=${twoFactorCode}`,
        { method: "POST", credentials: "include" },
      );
      if (response.ok) {
        toast.success("Securitate activată.");
        setShow2FAModal(false);
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error("Cod invalid.");
      }
    } finally {
      setActivating2FA(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
        }),
      });
      if (response.ok) toast.success("Profil actualizat.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );

  if (!user) return null;

  const initials =
    `${formData.firstName?.charAt(0) || ""}${formData.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[var(--dark-amethyst)] font-sans flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <header className="mb-20 space-y-4 text-left border-b border-zinc-100 pb-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--royal-violet)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--royal-violet)]">
                Setări Profil
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl tracking-tighter italic font-serif">
              Profilul <em>tău</em>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* STÂNGA: CARD IDENTITATE */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 space-y-8"
            >
              <div
                className="relative p-10 rounded-[3rem] text-white overflow-hidden shadow-2xl"
                style={{ backgroundColor: "var(--dark-amethyst)" }}
              >
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <Fingerprint size={200} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="size-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-4xl font-serif italic shadow-xl">
                      {initials || "L"}
                    </div>
                    <button
                      className="absolute -bottom-2 -right-2 size-10 rounded-2xl flex items-center justify-center text-white border-4 border-[var(--dark-amethyst)] transition-transform hover:scale-110 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, var(--royal-violet) 0%, var(--dark-amethyst) 100%)`,
                      }}
                    >
                      <Camera size={16} />
                    </button>
                  </div>

                  <h3 className="text-3xl italic font-serif mb-2">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">
                    {formData.email}
                  </p>

                  <div className="w-full space-y-4 pt-8 border-t border-white/10">
                    <StatusRow
                      icon={<Calendar size={14} />}
                      label="Membru din"
                      value="2026"
                    />
                    <StatusRow
                      icon={
                        user.is_two_factor_enabled ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <ShieldAlert size={14} />
                        )
                      }
                      label="Securitate"
                      value={
                        user.is_two_factor_enabled
                          ? "Protejat 2FA"
                          : "Nivel Standard"
                      }
                      highlight={user.is_two_factor_enabled}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={signOut}
                className="w-full py-5 rounded-[2rem] border border-zinc-200 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />{" "}
                Deconectare
              </button>
            </motion.div>

            {/* DREAPTA: FORMULAR EDITARE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8"
            >
              <form onSubmit={handleUpdate} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <ModernInput
                    label="Prenume"
                    value={formData.firstName}
                    onChange={(v: any) =>
                      setFormData({ ...formData, firstName: v })
                    }
                  />
                  <ModernInput
                    label="Nume"
                    value={formData.lastName}
                    onChange={(v: any) =>
                      setFormData({ ...formData, lastName: v })
                    }
                  />
                  <ModernInput
                    label="Telefon"
                    value={formData.phone}
                    onChange={(v: any) =>
                      setFormData({ ...formData, phone: v })
                    }
                    placeholder="+40"
                  />
                  <div className="space-y-3 opacity-50">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                      <Mail size={10} /> Email
                    </label>
                    <div className="h-14 border-b border-zinc-200 flex items-center font-serif italic tracking-tight">
                      {formData.email}
                    </div>
                  </div>
                </div>

                {/* 2FA PANEL */}
                <div
                  className={`p-10 rounded-[3rem] transition-all duration-700 border-2 ${user.is_two_factor_enabled ? "bg-white border-zinc-100 shadow-sm" : "bg-white border-dashed border-zinc-200"}`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Smartphone
                          size={20}
                          style={{
                            color: user.is_two_factor_enabled
                              ? "var(--royal-violet)"
                              : "#d4d4d8",
                          }}
                        />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">
                          Autentificare securizată
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-500 max-w-md leading-relaxed font-medium">
                        {user.is_two_factor_enabled
                          ? "Contul tău este protejat împotriva accesului neautorizat."
                          : "Adaugă un strat suplimentar de protecție contului tău."}
                      </p>
                    </div>

                    {!user.is_two_factor_enabled ? (
                      <button
                        type="button"
                        onClick={handleSetup2FA}
                        className="h-14 px-10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl hover:brightness-110 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, var(--royal-violet) 0%, var(--dark-amethyst) 100%)`,
                        }}
                      >
                        Activează 2FA
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 py-3 px-8 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                          Sistem Securizat
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-16 px-16 text-white rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all hover:scale-[1.02] disabled:opacity-30"
                    style={{ background: "var(--dark-amethyst)" }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        Salvează Profilul <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      {/* MODAL 2FA */}
      <LuxuryModal
        open={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title="Securitate Linea"
        description="Scanează codul pentru a asigura contul."
        className="!rounded-[3rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl"
      >
        <div className="space-y-12 py-6 px-2 text-left">
          <div className="flex justify-center relative group">
            <div
              className="absolute inset-0 blur-[60px] rounded-full scale-75 opacity-20"
              style={{ backgroundColor: "var(--royal-violet)" }}
            />
            <div className="relative p-7 bg-white rounded-[2.5rem] shadow-xl border border-zinc-100">
              {qrUrl ? (
                <div className="rounded-[1.5rem] overflow-hidden">
                  <QRCodeSVG
                    value={qrUrl}
                    size={200}
                    level="H"
                    fgColor="var(--dark-amethyst)"
                    includeMargin={false}
                  />
                </div>
              ) : (
                <Loader2 className="animate-spin text-zinc-100" size={32} />
              )}
            </div>
          </div>

          <div className="relative max-w-[340px] mx-auto">
            <input
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) =>
                setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full bg-transparent border-none text-transparent text-6xl text-center focus:ring-0 outline-none relative z-20 py-5 font-serif italic"
            />
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none z-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-center size-12"
                >
                  <motion.p
                    animate={
                      twoFactorCode.length > i
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 10 }
                    }
                    className="heading-serif italic text-6xl text-center absolute -mt-4 z-20"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    {twoFactorCode[i]}
                  </motion.p>
                  <p
                    className={`heading-serif italic text-6xl text-center absolute -mt-4 text-zinc-100 z-10 ${twoFactorCode.length > i ? "opacity-0" : "opacity-100"}`}
                  >
                    0
                  </p>
                  <div
                    className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full ${twoFactorCode.length === i ? `bg-[var(--royal-violet)]` : "bg-zinc-100"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm2FA}
            disabled={activating2FA || twoFactorCode.length < 6}
            className="w-full py-7 text-white rounded-full font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all active:scale-95 disabled:opacity-20"
            style={{
              background: `linear-gradient(135deg, var(--royal-violet) 0%, var(--dark-amethyst) 100%)`,
            }}
          >
            {activating2FA ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirmă Identitatea"
            )}
          </button>
        </div>
      </LuxuryModal>

      <Footer />
    </div>
  );
};

const StatusRow = ({ icon, label, value, highlight = false }: any) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-3 text-white/40">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
    <span
      className={`text-[10px] font-bold ${highlight ? "text-emerald-400" : "text-white"}`}
    >
      {value}
    </span>
  </div>
);

const ModernInput = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-3 group text-left">
    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-focus-within:text-[var(--royal-violet)] transition-colors">
      {label}
    </label>
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-14 bg-transparent border-b-2 border-zinc-100 focus:border-[var(--royal-violet)] outline-none text-base font-medium transition-all"
    />
  </div>
);

export default AccountProfile;
