import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import BrandStrip from "../components/content/BrandStrip";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";
import BrandManifesto from "../components/content/BrandManifesto";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        <HomeHero />
        <BrandStrip />

        <div className="mt-8 md:mt-16">
          <ProductCarousel
            title="Cele mai iubite"
            subtitle="Bestsellers EVEM"
          />
        </div>

        <CategoryShowcase />

        <div className="bg-foreground/[0.02] py-4">
          <ProductCarousel title="Noutăți în colecție" subtitle="Just Dropped" />
        </div>

        <BrandManifesto />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
