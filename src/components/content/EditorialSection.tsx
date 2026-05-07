import founders from "@/assets/founders.png";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
const EditorialSection = () => {
  return (
    <section className="w-full mb-32 px-6 border-t border-neutral-100 pt-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="max-w-[500px]">
          <h2 className="text-3xl font-light tracking-tight mb-8 leading-tight">
            Dialogul dintre Lumină și Umbră
          </h2>
          <div className="space-y-6 text-sm font-light text-neutral-600 leading-relaxed">
            <p>
              Linea a apărut din dorința de a aduce rigoarea arhitecturală în
              designul umbrelelor de soare. Credem că umbra nu este doar o
              funcție, ci o extensie a spațiului locuibil.
            </p>
            <p>
              Folosind materiale derivate din industria nautică și țesături
              tehnice de ultimă generație, produsele noastre oferă un adăpost
              sculptat, menit să reziste elementelor și să înnobileze peisajul.
            </p>
          </div>
          <button className="mt-10 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-black pb-1 hover:text-neutral-400 hover:border-neutral-400 transition-all">
            Descoperă Filosofia Noastră
          </button>
        </div>

        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src="/images/design-studio.jpg"
            alt="Atelierul de design Linea"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>
    </section>
  );
};
export default EditorialSection;
