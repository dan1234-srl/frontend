import heroImage from "@/assets/hero-image.png";
const LargeHero = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="w-full aspect-[21/9] md:aspect-[16/7] mb-6 overflow-hidden bg-zinc-100">
        <img
          src={heroImage}
          alt="Evem Architectural Shading"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover scale-105 animate-subtle-zoom"
        />
      </div>
      <div className="max-w-[800px]">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">
          Sculpting Sunlight
        </span>
        <h1 className="heading-serif text-4xl md:text-6xl text-foreground mb-4 leading-tight">
          Arhitectura Umbrei. <br />
          <span className="italic font-light">Esența Spațiului Exterior.</span>
        </h1>
        <p className="text-sm md:text-base font-light text-neutral-500 max-w-[500px]">
          Sisteme de protecție solară proiectate pentru a redefini microclimatul
          teraselor contemporane.
        </p>
      </div>
    </section>
  );
};

export default LargeHero;
