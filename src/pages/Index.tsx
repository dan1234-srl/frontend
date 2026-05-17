import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      <main className="flex-1 w-full relative">
        {/* Secțiunea Hero principală */}
        <HomeHero />

        {/* 🚀 REPARAT ATOMIC: Am redus pt-4 la pt-1 pe mobil și md:pt-4 pe desktop pentru a elimina golul alb dintre categorii și carusel */}
        <div className="relative z-10 w-full pt-1 md:pt-4 pb-8 md:pb-12">
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
