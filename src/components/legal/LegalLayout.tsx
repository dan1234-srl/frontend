import { ReactNode } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--dark-amethyst)] font-sans selection:bg-[var(--royal-violet)] selection:text-white antialiased">
      <Header />
      <div className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0" aria-hidden />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          {/* Decorative blur orbs (theme-aware) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 size-[520px] rounded-full blur-[140px] opacity-[0.18]"
            style={{ background: "var(--mauve-magic)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 size-[420px] rounded-full blur-[140px] opacity-[0.14]"
            style={{ background: "var(--lavender-purple)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--royal-violet)] transition-colors group mb-10"
            >
              <ArrowLeft
                size={12}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Înapoi
            </button>

            <div className="flex items-center justify-center gap-3 mb-5">
              <span
                className="h-[2px] w-8 rounded-full"
                style={{ background: "var(--primary-gradient)" }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-[0.5em]"
                style={{ color: "var(--royal-violet)" }}
              >
                {eyebrow}
              </span>
              <span
                className="h-[2px] w-8 rounded-full"
                style={{ background: "var(--primary-gradient)" }}
              />
            </div>

            <h1 className="heading-serif text-4xl md:text-6xl lg:text-7xl tracking-tighter italic leading-[1.05] text-[var(--dark-amethyst)]">
              {title}
            </h1>

            {updated && (
              <div className="mt-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border bg-white/60 backdrop-blur-xl shadow-sm"
                style={{
                  borderColor: "color-mix(in srgb, var(--royal-violet) 14%, transparent)",
                }}
              >
                <ShieldCheck size={12} style={{ color: "var(--royal-violet)" }} />
                <p
                  className="text-[9px] font-black uppercase tracking-[0.3em]"
                  style={{ color: "var(--royal-violet)" }}
                >
                  Ultima actualizare · {updated}
                </p>
              </div>
            )}
          </motion.div>
        </section>

        {/* CONTENT CARD */}
        <section className="relative pb-24 px-6">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-3xl mx-auto rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border shadow-[0_30px_80px_-30px_rgba(16,0,43,0.18)] px-7 py-10 md:px-14 md:py-16"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div
              className="absolute -top-px left-10 right-10 h-px"
              style={{ background: "var(--primary-gradient)", opacity: 0.6 }}
            />

            <div
              className="prose max-w-none
                prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-[var(--dark-amethyst)]
                prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-[color:color-mix(in_srgb,var(--royal-violet)_12%,transparent)]
                prose-h3:text-sm prose-h3:tracking-[0.2em] prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[var(--royal-violet)]
                prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-zinc-600
                prose-li:text-[15px] prose-li:text-zinc-600 prose-li:leading-relaxed
                prose-strong:text-[var(--dark-amethyst)] prose-strong:font-bold
                prose-a:text-[var(--royal-violet)] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4"
            >
              {children}
            </div>
          </motion.article>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
