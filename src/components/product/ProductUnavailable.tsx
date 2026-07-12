import { Link } from "react-router-dom";
import { PackageX, Sparkles, Truck, ShieldCheck, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCarousel from "@/components/content/ProductCarousel";

interface ProductUnavailableProps {
  variant: "not_found" | "out_of_stock";
  productName?: string;
  categorySlug?: string;
  categoryName?: string;
  inline?: boolean; // când e folosit ca înlocuitor pentru zona de preț/CTA
}

const COPY = {
  not_found: {
    eyebrow: "Piesă indisponibilă",
    title: "Această bijuterie și-a încheiat călătoria",
    subtitle:
      "Se pare că produsul căutat nu mai face parte din colecția noastră. Descoperă însă piese la fel de rafinate, atent selectate pentru tine.",
    icon: Search,
  },
  out_of_stock: {
    eyebrow: "Ediție epuizată",
    title: "Această piesă și-a găsit deja stăpânul",
    subtitle:
      "Stocul curent este epuizat. Explorează piese similare din aceeași colecție sau contactează un consultant Evem pentru o recomandare personalizată.",
    icon: PackageX,
  },
};

const ProductUnavailable = ({
  variant,
  productName,
  categorySlug,
  categoryName,
  inline = false,
}: ProductUnavailableProps) => {
  const copy = COPY[variant];
  const Icon = copy.icon;

  const shopHref = categorySlug ? `/category/${categorySlug}` : "/shop";

  const card = (
    <div className="relative overflow-hidden border border-neutral-100 bg-white animate-fade-in">
      {/* Halo decorativ */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--primary-gradient)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--primary-gradient)" }}
      />

      {/* Shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
        <div
          className="h-full w-1/3 animate-[slide-in-right_2.4s_ease-in-out_infinite]"
          style={{ background: "var(--primary-gradient)" }}
        />
      </div>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 flex flex-col items-center text-center">
        {/* Icon animat */}
        <div className="relative mb-6 animate-scale-in">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse"
            style={{ background: "var(--primary-gradient)" }}
          />
          <div
            className="relative h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center rounded-full text-white shadow-lg shadow-[var(--royal-violet)]/20"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Icon size={36} strokeWidth={1.5} />
            <Sparkles
              size={14}
              className="absolute -top-1 -right-1 text-white animate-pulse"
            />
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)] mb-3">
          {copy.eyebrow}
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic tracking-tight text-black leading-[1.15] max-w-xl">
          {copy.title}
        </h2>

        {productName && (
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            Ref. {productName}
          </p>
        )}

        <p className="mt-5 text-sm text-neutral-500 max-w-lg leading-relaxed">
          {copy.subtitle}
        </p>

        {/* Status pill */}
        <div className="mt-6 flex items-center gap-3 px-3 py-2 bg-neutral-50 rounded-sm">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              variant === "out_of_stock" ? "bg-amber-500" : "bg-rose-500"
            } animate-pulse`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              variant === "out_of_stock" ? "text-amber-600" : "text-rose-600"
            }`}
          >
            {variant === "out_of_stock" ? "Stoc epuizat" : "Produs indisponibil"}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Link to={shopHref} className="flex-1 group">
            <button
              className="w-full h-14 text-white rounded-none uppercase text-[10px] font-black tracking-[0.4em] transition-all shadow-lg shadow-[var(--royal-violet)]/10 flex items-center justify-center gap-3 relative overflow-hidden"
              style={{ background: "var(--primary-gradient)" }}
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">
                {categoryName ? `Vezi ${categoryName}` : "Vezi produse similare"}
              </span>
              <ArrowRight
                size={14}
                className="relative transition-transform group-hover:translate-x-1"
              />
            </button>
          </Link>
          <Link to="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-14 border-neutral-200 rounded-none uppercase text-[10px] font-black tracking-[0.4em] hover:text-[var(--royal-violet)] hover:border-[var(--royal-violet)] transition-all"
            >
              Înapoi acasă
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-md">
          <div className="flex items-center gap-3 p-3 border border-neutral-100 rounded-none">
            <Truck size={18} className="text-[var(--royal-violet)]" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                Livrare Rapidă
              </span>
              <span className="text-[8px] text-neutral-400 font-bold uppercase">
                24-48 Ore
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-neutral-100 rounded-none">
            <ShieldCheck size={18} className="text-[var(--royal-violet)]" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                Plată Securizată
              </span>
              <span className="text-[8px] text-neutral-400 font-bold uppercase">
                SSL Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) return card;

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto">{card}</div>

      {/* Recomandări */}
      <div className="mt-16 pt-12 border-t border-neutral-100">
        <ProductCarousel
          categorySlug={categorySlug}
          title="Piese Recomandate"
          subtitle="Selecții atent alese pentru tine"
        />
      </div>
    </div>
  );
};

export default ProductUnavailable;
