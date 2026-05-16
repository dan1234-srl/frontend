"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDescriptionProps {
  product: {
    description?: string;
    name?: string;
  };
}

/**
 * Renderer profesional pentru descrierile salvate cu bleach
 * (tag-uri permise: b, i, u, p, br, ul, li, strong, em).
 *
 * - Text simplu cu \n este transformat automat în paragrafe.
 * - Conținut HTML deja format este randat curat, fără reset-uri agresive.
 * - „Read more” pe înălțime, cu fade premium.
 */
const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const html = useMemo(() => {
    const raw = product?.description?.trim();
    if (!raw) return "";

    const hasHtml = /<(p|ul|ol|li|strong|em|b|i|u|br)[\s/>]/i.test(raw);
    if (hasHtml) return raw;

    // Text simplu → paragrafe + line breaks elegante
    return raw
      .split(/\n{2,}/)
      .map(
        (block) =>
          `<p>${block
            .split(/\n/)
            .map((l) => l.trim())
            .filter(Boolean)
            .join("<br/>")}</p>`,
      )
      .join("");
  }, [product?.description]);

  useEffect(() => {
    if (!contentRef.current) return;
    setNeedsClamp(contentRef.current.scrollHeight > 560);
  }, [html]);

  if (!html) return null;

  return (
    <section className="mt-16 pt-16 border-t border-zinc-100 w-full text-left">
      <div className="flex items-center gap-3 mb-10">
        <Sparkles size={14} className="text-[var(--royal-violet)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
          Detalii produs
        </span>
      </div>

      <h2 className="heading-serif text-3xl md:text-4xl tracking-tighter text-[var(--dark-amethyst)] mb-10">
        Descriere detaliată
      </h2>

      <div className="relative">
        <motion.div
          initial={false}
          animate={{ maxHeight: isExpanded || !needsClamp ? 5000 : 560 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            ref={contentRef}
            className="
              prose prose-zinc max-w-none font-sans
              prose-p:text-zinc-600 prose-p:leading-[1.85] prose-p:text-[15px] prose-p:my-4
              prose-strong:text-[var(--dark-amethyst)] prose-strong:font-black
              prose-em:text-zinc-700
              prose-ul:my-5 prose-ul:pl-5 prose-li:text-zinc-600 prose-li:text-[15px] prose-li:leading-[1.85] prose-li:my-1
              prose-li:marker:text-[var(--royal-violet)]
              [&_b]:text-[var(--dark-amethyst)] [&_b]:font-black
              [&_u]:decoration-[var(--royal-violet)] [&_u]:underline-offset-4
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>

        <AnimatePresence>
          {needsClamp && !isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/85 to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      {needsClamp && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="group flex items-center gap-3 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl active:scale-95 transition-all"
            style={{ background: "var(--primary-gradient)" }}
          >
            {isExpanded ? (
              <>
                Mai puține detalii <ChevronUp size={14} />
              </>
            ) : (
              <>
                Citește descrierea completă
                <ChevronDown
                  size={14}
                  className="group-hover:translate-y-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductDescription;
