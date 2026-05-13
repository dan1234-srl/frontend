"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDescriptionProps {
  product: {
    description: string;
    name: string;
  };
}

const ProductDescription = ({ product }: { product: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const parsedData = useMemo(() => {
    if (!product?.description) return { hasRichContent: false, cleanHtml: "" };

    const rawDescription = product.description;

    // 1. Verificăm dacă descrierea conține tag-uri HTML (Rich Content)
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(rawDescription);

    // 2. Verificăm dacă este text simplu dar are rânduri noi (\n)
    const hasNewLines = rawDescription.includes("\n");

    const hasRichContent =
      hasHtmlTags ||
      hasNewLines ||
      rawDescription.includes("<img") ||
      rawDescription.includes("<iframe");

    return {
      hasRichContent,
      cleanHtml: rawDescription,
    };
  }, [product?.description]);

  if (!product?.description) return null;

  return (
    <div className="mt-16 space-y-12 font-sans text-left pb-12 w-full border-t border-zinc-100 pt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
          Descriere Detaliată
        </h2>
      </div>

      <div className="relative">
        {/* Container principal cu limitare de înălțime */}
        <div
          className={`transition-all duration-1000 ease-in-out overflow-hidden relative ${
            !isExpanded ? "max-h-[800px]" : "max-h-full"
          }`}
        >
          <div
            className="prose prose-zinc max-w-none 
              /* 🚀 FIX CRITIC: whitespace-pre-line permite randarea rândurilor noi (\n) din textul simplu */
              whitespace-pre-line 
              
              /* RESETARE POZITIONARI FIXE/ABSOLUTE CARE STRICA LAYOUT-UL */
              [&_div]:static [&_div]:!inset-0 [&_div]:!w-full [&_div]:!max-w-full
              [&_section]:static [&_section]:!w-full
              
              /* REDIMENSIONARE SI CENTRARE IMAGINI */
              [&_img]:max-w-full md:[&_img]:max-w-[600px] [&_img]:h-auto [&_img]:block 
              [&_img]:mx-auto [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-8
              
              /* STILIZARE TEXT */
              prose-p:text-zinc-500 prose-p:leading-relaxed prose-p:text-[15px]
              prose-headings:text-zinc-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
              
              /* VIDEO SI TABELE */
              prose-iframe:w-full prose-iframe:max-w-[800px] prose-iframe:mx-auto prose-iframe:aspect-video prose-iframe:rounded-2xl prose-iframe:my-10
              prose-table:border-collapse prose-td:p-3 prose-td:border prose-td:border-zinc-100 prose-td:text-sm"
            dangerouslySetInnerHTML={{ __html: parsedData.cleanHtml }}
          />

          {/* Gradient de estompare (Fade out) - Apare doar când descrierea e restrânsă */}
          {!isExpanded && parsedData.hasRichContent && (
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
          )}
        </div>

        {/* Butonul Arată Mai Mult / Mai Puțin */}
        {parsedData.hasRichContent && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center gap-3 px-8 py-3 bg-zinc-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-300 z-20"
            >
              {isExpanded ? (
                <>
                  Mai puține detalii <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Vezi toată prezentarea{" "}
                  <ChevronDown
                    size={16}
                    className="group-hover:translate-y-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
