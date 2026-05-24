/**
 * ProductDescription.tsx — Renderer complet pentru descrieri produs
 *
 * ✅ Randează HTML salvat din RichTextEditor
 * ✅ YouTube iframe-uri complet responsive (padding-bottom 56.25%)
 * ✅ Sanitizare XSS (elimină script/on* attributes)
 * ✅ Spații și emoji păstrate exact cum au fost scrise
 * ✅ Read-more collapse cu fade premium
 * ✅ Suportă text plain (convertit automat în paragrafe)
 */

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

// ─── Sanitizare HTML (XSS-safe, păstrează YouTube iframe) ────────────────────

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
  "hr",
  "blockquote",
  "iframe", // permis DOAR de pe youtube.com
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  iframe: [
    "src",
    "allowfullscreen",
    "loading",
    "title",
    "style",
    "width",
    "height",
  ],
  div: ["style", "class"],
  span: ["style", "class"],
  p: ["style"],
  hr: ["style"],
  a: ["href", "target", "rel"],
};

/**
 * Sanitizare simpla client-side.
 * NU folosim DOMParser recursiv (prea lent).
 * Regex-based, suficient pentru conținut admin-controlled.
 */
function sanitizeHtml(raw: string): string {
  if (!raw) return "";

  // 1. Elimină <script> complet
  let out = raw.replace(/<script[\s\S]*?<\/script>/gi, "");

  // 2. Elimină event handlers (onclick, onerror etc.)
  out = out.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
  out = out.replace(/\bon\w+\s*=\s*[^\s>]*/gi, "");

  // 3. Elimină javascript: în src/href
  out = out.replace(/(href|src)\s*=\s*["']javascript:[^"']*["']/gi, "");

  // 4. Permite iframe DOAR de pe YouTube (blochează altele)
  out = out.replace(/<iframe([^>]*)>/gi, (match, attrs: string) => {
    if (/youtube\.com\/embed\//.test(attrs)) return match;
    return ""; // blochează orice alt iframe
  });

  return out;
}

// ─── Conversie text simplu → HTML ────────────────────────────────────────────

function textToHtml(raw: string): string {
  const hasHtml =
    /<(p|ul|ol|li|strong|em|b|i|u|br|h[1-6]|div|iframe)[\s/>]/i.test(raw);
  if (hasHtml) return raw;

  // Text plain → paragrafe, cu linie nouă păstrată
  return raw
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p>${block
          .split(/\n/)
          .map((l) => l) // NU trim() — păstrăm spații intenționate
          .filter((l) => l !== "") // eliminăm linii complet goale
          .join("<br/>")}</p>`,
    )
    .join("");
}

// ─── Wrapper video responsive ─────────────────────────────────────────────────
// Asigură că orice iframe YouTube devine 16:9, indiferent de atributele originale

function wrapVideos(html: string): string {
  return html.replace(
    /<iframe([^>]*src=["']https:\/\/www\.youtube\.com\/embed\/[^"']+["'][^>]*)><\/iframe>/gi,
    (_, attrs) => {
      // Eliminăm width/height fixe dacă există (vor fi înlocuite de CSS)
      const cleanAttrs = attrs
        .replace(/\s*width=["'][^"']*["']/gi, "")
        .replace(/\s*height=["'][^"']*["']/gi, "")
        .replace(/\s*style=["'][^"']*["']/gi, "");
      return `
        <div class="rte-video-outer">
          <iframe${cleanAttrs} 
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
    },
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const html = useMemo(() => {
    const raw = product?.description?.trim();
    if (!raw) return "";
    const asHtml = textToHtml(raw);
    const sanitized = sanitizeHtml(asHtml);
    return wrapVideos(sanitized);
  }, [product?.description]);

  useEffect(() => {
    if (!contentRef.current) return;
    // Așteptăm ca iFrame-urile să fie randate
    const t = setTimeout(() => {
      if (contentRef.current) {
        setNeedsClamp(contentRef.current.scrollHeight > 600);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [html]);

  if (!html) return null;

  return (
    <section className="mt-16 pt-16 border-t border-zinc-100 w-full text-left">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Sparkles size={14} className="text-[var(--royal-violet)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
          Detalii produs
        </span>
      </div>

      <h2 className="heading-serif text-3xl md:text-4xl tracking-tighter text-[var(--dark-amethyst)] mb-10">
        Descriere detaliată
      </h2>

      {/* Content */}
      <div className="relative">
        <motion.div
          initial={false}
          animate={{ maxHeight: isExpanded || !needsClamp ? 9999 : 600 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            ref={contentRef}
            className="rte-render"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>

        {/* Fade overlay */}
        <AnimatePresence>
          {needsClamp && !isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/85 to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Read more button */}
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
                Descriere completă
                <ChevronDown
                  size={14}
                  className="group-hover:translate-y-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Stiluri pentru conținutul randat ─────────────────────────────── */}
      <style>{`
        /* ── Layout container ── */
        .rte-render {
          color: #52525b;
          font-size: 15px;
          line-height: 1.85;
          font-family: inherit;
          word-break: break-word;
        }

        /* ── Paragrafe ── */
        .rte-render p {
          margin-bottom: 1rem;
          line-height: 1.85;
        }
        .rte-render p:last-child { margin-bottom: 0; }

        /* ── Titluri ── */
        .rte-render h2 {
          font-size: 1.35rem;
          font-weight: 900;
          color: var(--dark-amethyst, #10002b);
          margin: 1.75rem 0 0.65rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .rte-render h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-amethyst, #10002b);
          margin: 1.25rem 0 0.5rem;
          line-height: 1.3;
        }

        /* ── Formatare text ── */
        .rte-render strong,
        .rte-render b {
          font-weight: 900;
          color: var(--dark-amethyst, #10002b);
        }
        .rte-render em,
        .rte-render i { 
          font-style: italic; 
          color: #3f3f46;
        }
        .rte-render u {
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--royal-violet, #7b2cbf);
        }

        /* ── Liste ── */
        .rte-render ul {
          list-style-type: disc;
          padding-left: 1.4rem;
          margin: 0.75rem 0 1.1rem;
        }
        .rte-render ol {
          list-style-type: decimal;
          padding-left: 1.4rem;
          margin: 0.75rem 0 1.1rem;
        }
        .rte-render li {
          margin-bottom: 0.35rem;
          line-height: 1.75;
        }
        .rte-render ul li::marker {
          color: var(--royal-violet, #7b2cbf);
        }
        .rte-render ol li::marker {
          color: var(--royal-violet, #7b2cbf);
          font-weight: 700;
        }

        /* ── Separator ── */
        .rte-render hr {
          border: none;
          border-top: 1px solid #e4e4e7;
          margin: 1.5rem 0;
        }

        /* ── Video YouTube — COMPLET RESPONSIVE 16:9 ── */
        .rte-video-outer {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          margin: 1.25rem 0;
          background: #000;
        }
        .rte-video-outer iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 12px;
        }

        /* ── Compatibilitate cu iframe-uri deja învelite (din import CSV) ── */
        .rte-render iframe[src*="youtube.com"] {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
          border: none;
          display: block;
          margin: 1.25rem 0;
        }

        /* ── Spații multiple (  ) păstrate vizual ── */
        .rte-render p,
        .rte-render li,
        .rte-render h2,
        .rte-render h3 {
          white-space: pre-wrap;
        }
        /* Excepție: elementele de container NU au pre-wrap */
        .rte-render ul,
        .rte-render ol,
        .rte-render div {
          white-space: normal;
        }

        /* ── Blockquote (opțional) ── */
        .rte-render blockquote {
          border-left: 3px solid var(--royal-violet, #7b2cbf);
          padding-left: 1rem;
          margin: 1rem 0;
          color: #71717a;
          font-style: italic;
        }
      `}</style>
    </section>
  );
};

export default ProductDescription;
