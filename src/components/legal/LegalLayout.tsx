import { ReactNode } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { motion } from "framer-motion";

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}

const LegalLayout = ({ eyebrow, title, updated, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Header />
      <div
        className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
        aria-hidden="true"
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-100 bg-gradient-to-b from-white to-zinc-50/40">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-zinc-900" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-5">
              {eyebrow}
            </span>
            <h1 className="heading-serif text-4xl md:text-6xl text-zinc-900 leading-tight">
              {title}
            </h1>
            {updated && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mt-6">
                Ultima actualizare: {updated}
              </p>
            )}
          </motion.div>
        </section>

        {/* Content */}
        <section className="max-w-3xl mx-auto px-6 py-12 md:py-20">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-zinc max-w-none
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-zinc-900
              prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-zinc-100
              prose-h3:text-sm prose-h3:tracking-[0.2em] prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-zinc-700
              prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-zinc-600
              prose-li:text-[15px] prose-li:text-zinc-600 prose-li:leading-relaxed
              prose-strong:text-zinc-900 prose-strong:font-bold
              prose-a:text-zinc-900 prose-a:underline-offset-4"
          >
            {children}
          </motion.article>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
