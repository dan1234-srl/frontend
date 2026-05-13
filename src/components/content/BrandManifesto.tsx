import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const BrandManifesto = () => {
  return (
    <section className="w-full px-4 md:px-8 py-20 md:py-32">
      <div
        className="relative mx-auto max-w-[1800px] rounded-3xl overflow-hidden p-10 md:p-20"
        style={{
          background:
            "linear-gradient(135deg, var(--dark-amethyst) 0%, var(--indigo-velvet) 60%, var(--royal-violet) 100%)",
        }}
      >
        {/* Soft glow accents */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{ background: "var(--mauve-magic)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "var(--lavender-purple)" }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 block mb-5">
              Manifesto EVEM
            </span>
            <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05] mb-6">
              Mai mult decât{" "}
              <span className="italic font-light opacity-85">obiecte.</span>{" "}
              Piese care îți spun povestea.
            </h2>
            <p className="text-base font-light opacity-80 leading-relaxed max-w-xl mb-8">
              EVEM este locul unde stilul personal se întâlnește cu obiectele
              alese cu grijă — de la vestimentație contemporană și bijuterii
              statement, la accesorii care îți completează ritualul zilnic.
            </p>
            <Link
              to="/about/our-story"
              className="inline-flex items-center gap-3 bg-white text-foreground px-7 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white/90 transition-all"
            >
              Povestea noastră
              <ArrowUpRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { k: "20K+", v: "Clienți mulțumiți" },
              { k: "500+", v: "Produse selectate" },
              { k: "48h", v: "Livrare rapidă" },
              { k: "4.9/5", v: "Rating mediu" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-6 md:p-8"
              >
                <p className="heading-serif text-3xl md:text-4xl mb-1">
                  {s.k}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">
                  {s.v}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandManifesto;
