import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      {/* Header-ul rămâne fix sau static în fluxul său izolat */}
      <Header />

      <main className="flex-1 w-full relative">
        {/* Secțiunea Hero principală */}
        <HomeHero />

        {/* 🚀 REPARAT: Containerul caruselului folosește poziționare relativă curată fără margini negative distructive */}
        <div className="relative z-10 w-full pt-4 md:pt-6 pb-8 md:pb-12">
          <ProductCarousel
            title="Cele mai iubite"
            subtitle="Bestsellers EVEM"
          />
        </div>

        {/* Secțiunea de categorii editorială */}
        <CategoryShowcase />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
