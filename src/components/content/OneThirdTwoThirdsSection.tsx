import circularCollection from "@/assets/circular-collection.png";
import organicEarring from "@/assets/organic-earring.png";
import { Link } from "react-router-dom";

const OneThirdTwoThirdsSection = () => {
  return (
    <section className="w-full mb-24 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="w-full h-[600px] mb-4 overflow-hidden bg-neutral-50">
            <img
              src="/images/detail-mechanism.jpg"
              alt="Mecanism aluminiu eloxat"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            Precision Gear
          </h3>
          <p className="text-sm font-light text-neutral-500">
            Fiecare manivelă și articulație este sculptată în oțel inoxidabil și
            aluminiu marin.
          </p>
        </div>

        <div className="lg:col-span-2">
          <div className="w-full h-[600px] mb-4 overflow-hidden bg-neutral-50">
            <img
              src="/images/full-terrace-view.jpg"
              alt="Configurație terasă luxury"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            Atmospheric Design
          </h3>
          <p className="text-sm font-light text-neutral-500">
            Sisteme modulare capabile să redefinească microclimatul spațiului
            tău exterior.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OneThirdTwoThirdsSection;
