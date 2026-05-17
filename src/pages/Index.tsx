import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      {/* 🚀 REPARAT ATOMIC: Am adăugat blocul Spacer identic cu cel din CategoryPage 
         (9.25rem pe desktop, forțat adaptiv pe ecrane mici la h-[8.5rem]).
         Acesta împinge automat secțiunea sub Navbar pe orice dispozitiv, eliminând suprapunerea!
      */}
      <div
        className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
        aria-hidden="true"
      />

      <main className="flex-1 w-full relative">
        {/* Secțiunea Hero principală */}
        <HomeHero />

        {/* Container carusel Bestsellers */}
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
