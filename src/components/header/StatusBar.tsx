import { useEffect, useState } from "react";

const usps = [
  { ro: "Livrare gratuită peste 250 RON", en: "Complimentary delivery over €50" },
  { ro: "Garanție extinsă 365 de zile", en: "365-day extended warranty" },
  { ro: "Atelier propriu • București", en: "In-house atelier • Bucharest" },
];

import { useLanguage } from "@/contexts/LanguageContext";

const StatusBar = () => {
  const { language } = useLanguage();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % usps.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-foreground text-background py-2.5 overflow-hidden">
      <div className="container relative h-4 text-center">
        <p
          key={i}
          className="absolute inset-0 text-[10px] sm:text-[11px] font-medium tracking-[0.18em] uppercase animate-fade-in"
        >
          {usps[i][language]}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;
