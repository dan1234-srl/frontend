import { useState } from "react";
import { Link } from "react-router-dom";
import { PackageX, Search, ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCarousel from "@/components/content/ProductCarousel";
import { toast } from "sonner";

interface ProductUnavailableProps {
  variant: "not_found" | "out_of_stock";
  productName?: string;
  categorySlug?: string;
  categoryName?: string;
  inline?: boolean;
}

const COPY = {
  not_found: {
    eyebrow: "Colecție Arhivată",
    title: "Această piesă și-a încheiat călătoria",
    subtitle:
      "Modelul căutat nu mai face parte din portofoliul nostru curent. Vă invităm să descoperiți noile creații din colecție.",
    icon: Search,
  },
  out_of_stock: {
    eyebrow: "Stoc Indisponibil",
    title: "Ediție epuizată momentan",
    subtitle:
      "Toate exemplarele disponibile și-au găsit proprietarul. Puteți solicita notificarea la revenirea stocului sau contacta un consultant.",
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
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[variant];
  const shopHref = categorySlug ? `/category/${categorySlug}` : "/shop";

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      // Fake delay - aici poți integra fetch-ul tău către backend:
      // POST /api/v1/notifications/stock-alert
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsSubscribed(true);
      toast.success("Opțiunea pentru notificare a fost înregistrată!");
    } catch (error) {
      toast.error("A apărut o eroare. Vă rugăm să reîncercați.");
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="relative border-t border-b border-neutral-200 bg-transparent animate-fade-in text-left py-12 md:py-16">
      <div className="max-w-xl space-y-6">
        {/* Identificator / Eyebrow */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            {copy.eyebrow}
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* Titlu Principal */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-light tracking-tight text-neutral-900 leading-[1.15]">
          {copy.title}
        </h2>

        {/* Nume Produs / Referință */}
        {productName && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 bg-neutral-100 inline-block px-2.5 py-1">
            {productName}
          </p>
        )}

        {/* Subtitlu */}
        <p className="text-sm text-neutral-500 font-normal leading-relaxed">
          {copy.subtitle}
        </p>

        {/* Zona Dinamică: Formular Notificare vs Succes */}
        {variant === "out_of_stock" && (
          <div className="pt-4 border-t border-neutral-100">
            {!isSubscribed ? (
              <form onSubmit={handleNotifySubmit} className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">
                  Solicită Alertă Stoc
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    disabled={submitting}
                    placeholder="Introduceți adresa de email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 bg-white border border-neutral-200 px-4 text-xs font-medium text-neutral-800 outline-none focus:border-black transition-all rounded-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-12 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 transition-all rounded-none flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Bell size={12} />
                    {submitting ? "Se procesează..." : "Anunță-mă"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-3 bg-neutral-50 p-4 border border-neutral-200/60 animate-scale-in">
                <CheckCircle2
                  size={16}
                  className="text-neutral-800 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Solicitare Confirmată
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Veți primi un email imediat ce piesa redevine disponibilă
                    pentru achiziție.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigație / CTA Minimalist */}
        <div className="pt-4 flex flex-wrap gap-4 items-center">
          <Link
            to={shopHref}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 transition-colors hover:text-neutral-600"
          >
            <span>
              {categoryName
                ? `Explorează ${categoryName}`
                : "Vezi Colecția Generală"}
            </span>
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <span className="text-neutral-300 hidden sm:inline">|</span>

          <Link
            to="/"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Înapoi la prima pagină
          </Link>
        </div>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <div className="w-full bg-white px-4 py-8">
      <div className="max-w-5xl mx-auto">{content}</div>

      {/* Carusel Recomandări Subiacente */}
      <div className="mt-20">
        <ProductCarousel
          categorySlug={categorySlug}
          title="Alternative Sugerate"
          subtitle="Piese complementare selectate manual din portofoliul Evem"
        />
      </div>
    </div>
  );
};

export default ProductUnavailable;
