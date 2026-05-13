import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCcw, Sparkles } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Livrare rapidă",
    desc: "24-48h în toată țara",
  },
  {
    icon: ShieldCheck,
    title: "Plăți securizate",
    desc: "Stripe & 3D Secure",
  },
  {
    icon: RefreshCcw,
    title: "Retur 30 zile",
    desc: "Fără bătăi de cap",
  },
  {
    icon: Sparkles,
    title: "Selecție curată",
    desc: "Doar branduri verificate",
  },
];

const BrandStrip = () => (
  <section className="w-full px-4 md:px-8 mt-12 md:mt-16">
    <div className="mx-auto max-w-[1800px] rounded-3xl border border-border/60 bg-white/70 backdrop-blur-md py-6 md:py-8 px-6 md:px-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex items-center gap-4"
          >
            <div
              className="size-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                color: "var(--dark-amethyst)",
              }}
            >
              <it.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                {it.title}
              </p>
              <p className="text-xs text-foreground/55 mt-0.5">{it.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BrandStrip;
