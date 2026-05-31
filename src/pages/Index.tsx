import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import CategoryShowcase from "../components/content/CategoryShowcase";
import AllProductsAccordion from "../components/content/AllProductsAccordion";
import NewsletterPopup from "../components/marketing/NewsletterPopup";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Index = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Preluăm lista de colecții dinamice de la backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/collections/`)
      .then((res) => res.json())
      .then((data) => {
        setCollections(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la preluarea colecțiilor:", err);
        setIsLoading(false);
      });
  }, []);

  // Helper pentru a transforma slug-ul (ex: "top-sales") în titlu frumos ("Top Sales")
  const formatTitle = (slug: string) => {
    const parts = slug.replace(/-/g, " ").split(" ");
    return {
      first: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
      rest: parts.slice(1).join(" "),
    };
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header />

      <div
        className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
        aria-hidden="true"
      />

      <main className="flex-1 w-full relative">
        <HomeHero />

        {/* 3. SECȚIUNI DINAMICE (Generate automat) */}
        {!isLoading &&
          collections.map((colType) => {
            const titleParts = formatTitle(colType);
            return (
              <div key={colType} className="relative z-10 w-full pb-8 md:pb-12">
                <ProductCarousel
                  title={
                    (
                      <>
                        {titleParts.first}{" "}
                        <span className="italic font-light text-zinc-500">
                          {titleParts.rest}
                        </span>
                      </>
                    ) as any
                  }
                  subtitle={`${titleParts.first} ${titleParts.rest} EVEM`}
                  collectionType={colType} // Trimit tipul către componentă
                />
              </div>
            );
          })}

        {/* Toate produsele - accordion */}
        <AllProductsAccordion />
      </main>

      <NewsletterPopup />
      <Footer />
    </div>
  );
};

export default Index;
