import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  Instagram,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Preia tema backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/themes/active`)
      .then((res) => res.json())
      .then((theme) => {
        if (!theme) return;
        const root = document.documentElement;
        if (theme.dark_amethyst)
          root.style.setProperty("--dark-amethyst", theme.dark_amethyst);
        if (theme.royal_violet)
          root.style.setProperty("--royal-violet", theme.royal_violet);
        if (theme.primary_gradient)
          root.style.setProperty("--primary-gradient", theme.primary_gradient);
      })
      .catch((err) => console.warn("Eroare încărcare temă Contact:", err));

    window.scrollTo(0, 0);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulare trimitere (Aici poți lega un endpoint de pe backend ulterior)
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Mesajul a fost trimis cu succes!", {
        description: "Îți vom răspunde în cel mai scurt timp posibil.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fcfbfe] flex flex-col relative overflow-hidden">
      {/* Glow-uri ambientale */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[var(--royal-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none -mt-40 -mr-40" />
      <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-[var(--dark-amethyst)] opacity-[0.02] rounded-full blur-[100px] pointer-events-none -ml-40" />

      <Header />

      <main className="flex-1 w-full relative pt-36 pb-20">
        <div className="w-[90%] max-w-[1400px] mx-auto flex flex-col gap-16">
          {/* TITLU PAGINĂ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <span
                className="w-8 h-[2px]"
                style={{ background: "var(--primary-gradient)" }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                Suntem aici
              </span>
              <span
                className="w-8 h-[2px]"
                style={{ background: "var(--primary-gradient)" }}
              />
            </div>
            <h1 className="heading-serif text-4xl md:text-6xl font-medium tracking-tighter text-[var(--dark-amethyst)]">
              Hai să <span className="italic">Vorbim</span>
            </h1>
          </motion.div>

          {/* GRID FORMULAR & INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* PARTEA STÂNGĂ: INFORMAȚII DE CONTACT */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 space-y-10"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-[var(--dark-amethyst)]">
                  Contact Direct
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  Fie că ai o întrebare despre un produs, o comandă existentă
                  sau un proiect personalizat, echipa noastră este pregătită să
                  îți ofere suportul necesar.
                </p>
              </div>

              <div className="space-y-8">
                {/* Info Item: Adresa */}
                <div className="flex items-start gap-4 group">
                  <div className="size-12 rounded-2xl bg-[var(--royal-violet)]/5 border border-[var(--royal-violet)]/10 flex items-center justify-center text-[var(--royal-violet)] group-hover:bg-[var(--royal-violet)] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <MapPin size={20} strokeWidth={2} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Adresă Sediu
                    </p>
                    <p className="text-sm font-semibold text-[var(--dark-amethyst)] leading-snug">
                      Prelungirea Ghencea 124D
                      <br />
                      Sector 6, București, România
                    </p>
                    <p className="text-xs font-medium text-zinc-500 pt-1">
                      Tufan Logistic Expert SRL
                    </p>
                  </div>
                </div>

                {/* Info Item: Email */}
                <div className="flex items-start gap-4 group">
                  <div className="size-12 rounded-2xl bg-[var(--royal-violet)]/5 border border-[var(--royal-violet)]/10 flex items-center justify-center text-[var(--royal-violet)] group-hover:bg-[var(--royal-violet)] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <Mail size={20} strokeWidth={2} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      E-mail
                    </p>
                    <a
                      href="mailto:daniel.tufan@consultant.com"
                      className="text-sm font-semibold text-[var(--dark-amethyst)] hover:text-[var(--royal-violet)] transition-colors"
                    >
                      daniel.tufan@consultant.com
                    </a>
                  </div>
                </div>

                {/* Info Item: Telefon */}
                <div className="flex items-start gap-4 group">
                  <div className="size-12 rounded-2xl bg-[var(--royal-violet)]/5 border border-[var(--royal-violet)]/10 flex items-center justify-center text-[var(--royal-violet)] group-hover:bg-[var(--royal-violet)] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <Phone size={20} strokeWidth={2} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Telefon
                    </p>
                    <a
                      href="tel:+40735928664"
                      className="text-sm font-semibold text-[var(--dark-amethyst)] hover:text-[var(--royal-violet)] transition-colors"
                    >
                      +40 735 928 664
                    </a>
                  </div>
                </div>

                {/* Info Item: Program */}
                <div className="flex items-start gap-4 group">
                  <div className="size-12 rounded-2xl bg-[var(--royal-violet)]/5 border border-[var(--royal-violet)]/10 flex items-center justify-center text-[var(--royal-violet)] group-hover:bg-[var(--royal-violet)] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <Clock size={20} strokeWidth={2} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Program
                    </p>
                    <p className="text-sm font-semibold text-[var(--dark-amethyst)]">
                      Luni - Vineri: 09:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 flex gap-3">
                <a
                  href="https://www.instagram.com/evem.ro?igsh=NGE5aTN2dWVvanho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-[var(--royal-violet)] hover:text-white transition-all duration-300"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/people/Evemro/100069947145940/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-[var(--royal-violet)] hover:text-white transition-all duration-300"
                >
                  <Facebook size={18} />
                </a>
              </div>
            </motion.div>

            {/* PARTEA DREAPTĂ: FORMULAR DE CONTACT */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-7"
            >
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[var(--royal-violet)]/5 relative overflow-hidden">
                {/* Glow subtil în card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-gradient)] opacity-5 blur-[80px]" />

                <h3 className="text-2xl font-semibold text-[var(--dark-amethyst)] mb-8">
                  Trimite-ne un mesaj
                </h3>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 relative z-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 pl-2">
                        Nume Complet
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Popescu Ion"
                        className="w-full h-14 bg-zinc-50/50 border border-zinc-200 rounded-2xl px-5 text-sm font-medium outline-none focus:bg-white focus:border-[var(--royal-violet)] focus:ring-4 focus:ring-[var(--royal-violet)]/10 transition-all text-[var(--dark-amethyst)] placeholder:text-zinc-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 pl-2">
                        E-mail
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="adresa@email.com"
                        className="w-full h-14 bg-zinc-50/50 border border-zinc-200 rounded-2xl px-5 text-sm font-medium outline-none focus:bg-white focus:border-[var(--royal-violet)] focus:ring-4 focus:ring-[var(--royal-violet)]/10 transition-all text-[var(--dark-amethyst)] placeholder:text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 pl-2">
                      Subiect
                    </label>
                    <input
                      required
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Despre ce dorești să vorbim?"
                      className="w-full h-14 bg-zinc-50/50 border border-zinc-200 rounded-2xl px-5 text-sm font-medium outline-none focus:bg-white focus:border-[var(--royal-violet)] focus:ring-4 focus:ring-[var(--royal-violet)]/10 transition-all text-[var(--dark-amethyst)] placeholder:text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 pl-2">
                      Mesaj
                    </label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Scrie mesajul tău aici..."
                      rows={5}
                      className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5 text-sm font-medium outline-none focus:bg-white focus:border-[var(--royal-violet)] focus:ring-4 focus:ring-[var(--royal-violet)]/10 transition-all text-[var(--dark-amethyst)] placeholder:text-zinc-300 resize-none luxury-scrollbar"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:brightness-110 shadow-lg shadow-[var(--royal-violet)]/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        Trimite Mesajul <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* SECȚIUNE HARTĂ THEMED */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full pt-8"
          >
            <div className="relative w-full h-[450px] rounded-[3rem] overflow-hidden shadow-sm border border-zinc-200/50 group bg-zinc-100">
              {/* TRUCUL CSS PENTRU HARTĂ: Overlay care colorează iframe-ul grayscale */}
              <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-color"
                style={{
                  backgroundColor: "var(--royal-violet)",
                  opacity: 0.25,
                }}
              />
              <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundColor: "var(--dark-amethyst)",
                  opacity: 0.4,
                }}
              />

              <iframe
                title="Locație EVEM"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2850.569305105151!2d26.0123512!3d44.4061214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b201a4e51147a7%3A0x88f5539bc1f9b5a1!2sPrelungirea%20Ghencea%20124D%2C%20Bucure%C8%99ti!5e0!3m2!1sro!2sro!4v1700000000000!5m2!1sro!2sro"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: "grayscale(100%) contrast(1.1) brightness(1.05)",
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full transition-transform duration-[20s] ease-linear group-hover:scale-110"
              />

              {/* Floating Card Peste Hartă */}
              <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-xl max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="size-8 rounded-full flex items-center justify-center text-white"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <MapPin size={14} />
                  </div>
                  <h4 className="font-bold text-sm text-[var(--dark-amethyst)]">
                    Sediul Central
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Te așteptăm la sediul nostru pentru ridicarea comenzilor sau
                  consultanță de specialitate.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
