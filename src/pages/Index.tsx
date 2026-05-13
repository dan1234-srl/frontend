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

        <div className="mt-8 md:mt-16">
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
