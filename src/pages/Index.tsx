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

        <div className="bg-foreground/[0.02] py-4">
          <ProductCarousel
            title="Noutăți în colecție"
            subtitle="Just Dropped"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
