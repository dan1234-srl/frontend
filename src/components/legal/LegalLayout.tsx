import { ReactNode } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}

const LegalLayout = ({
  eyebrow,
  title,
  updated,
  children,
}: LegalLayoutProps) => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Efect de parallaxe subtil pentru titlu
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[var(--dark-amethyst)] font-sans selection:bg-[var(--royal-violet)]/20">
      <Header />

      <div className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, var(--royal-violet) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <main className="max-w-5xl mx-auto px-6">
          {/* HERO Section */}
          <div className="text-center mb-16 relative">
            <motion.div style={{ y }} className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--royal-violet)]/5 border border-[var(--royal-violet)]/10">
                <Sparkles size={10} className="text-[var(--royal-violet)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                  {eyebrow}
                </span>
              </div>

              <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter text-[var(--dark-amethyst)]">
                {title}
              </h1>

              {updated && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  <span>Actualizat pe {updated}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* MAIN CONTENT CARD */}
          <div className="relative group">
            {/* Gradient Border Overlay */}
            <div className="absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-br from-[var(--royal-violet)]/20 via-transparent to-[var(--mauve-magic)]/20 opacity-50 blur" />

            <article className="relative bg-white rounded-[2.5rem] border border-zinc-200/60 p-8 md:p-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--royal-violet)] transition-colors"
              >
                <ArrowLeft size={14} /> Înapoi
              </button>

              <div
                className="prose max-w-none 
                prose-headings:font-serif prose-headings:font-medium prose-headings:text-[var(--dark-amethyst)]
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-[var(--royal-violet)] prose-h2:pl-4
                prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-[0.2em] prose-h3:text-[var(--royal-violet)] prose-h3:mt-8
                prose-p:text-[15px] prose-p:leading-loose prose-p:text-zinc-600 prose-p:font-light
                prose-ul:space-y-3 prose-li:text-[15px] prose-li:text-zinc-600 prose-li:marker:text-[var(--royal-violet)]
                prose-strong:font-bold prose-strong:text-zinc-900
                prose-a:text-[var(--royal-violet)] prose-a:font-semibold hover:prose-a:underline"
              >
                {children}
              </div>
            </article>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default LegalLayout;
