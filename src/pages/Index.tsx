import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        <HomeHero />

        {/* Am eliminat mt-8 md:mt-16 pentru a lipi caruselul de secțiunea de sus */}
        <div className="-mt-4 md:-mt-8 relative z-10">
          <ProductCarousel
            title="Cele mai iubite"
            subtitle="Bestsellers EVEM"
          />
        </div>

        <CategoryShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
