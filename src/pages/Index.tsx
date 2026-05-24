import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";
import AllProductsAccordion from "../components/content/AllProductsAccordion";
import NewsletterPopup from "../components/marketing/NewsletterPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      <div
        className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
        aria-hidden="true"
      />

      <main className="flex-1 w-full relative">
        <HomeHero />

        {/* Favorite */}
        <div className="relative z-10 w-full pt-1 md:pt-4 pb-4 md:pb-8">
          <ProductCarousel
            title={
              <>
                Favoritele <span className="italic font-light text-zinc-500">comunității</span>
              </> as any
            }
            subtitle="Top Wishlist EVEM"
            sort="favorites"
          />
        </div>

        {/* Bestsellers */}
        <div className="relative z-10 w-full pb-8 md:pb-12">
          <ProductCarousel
            title={
              <>
                Cele mai{" "}
                <span className="italic font-light text-zinc-500">vândute</span>
              </> as any
            }
            subtitle="Bestsellers EVEM"
            sort="best-sales"
          />
        </div>

        {/* Toate produsele - accordion */}
        <AllProductsAccordion />

        <CategoryShowcase />
      </main>

      <NewsletterPopup />
      <Footer />
    </div>
  );
};

export default Index;
