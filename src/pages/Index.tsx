import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomeHero from "../components/content/HomeHero";
import ProductCarousel from "../components/content/ProductCarousel";
import AllProductsAccordion from "../components/content/AllProductsAccordion";
import NewsletterPopup from "../components/marketing/NewsletterPopup";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Index = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const formatTitle = (slug: string) => {
    const parts = slug.replace(/-/g, " ").split(" ");
    return {
      first: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
      rest: parts.slice(1).join(" "),
    };
  };

  return (
    <div className="min-h-screen bg-[#fcfbfe] overflow-x-hidden flex flex-col relative">
      {/* Glow-uri ambientale pentru aspect premium */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--royal-violet)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none -mt-40 -mr-40" />

      <Header />

      {/* Main cu pt-28 (reglează acest număr dacă vrei mai mult/puțin spațiu sub Header) */}
      <main className="flex-1 w-full relative pt-28 lg:pt-32">
        {/* CONTAINER 90% (max 1700px) */}
        <div className="w-[90%] max-w-[1700px] mx-auto flex flex-col gap-12 md:gap-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <HomeHero />
          </motion.div>

          {/* SECȚIUNI DINAMICE */}
          {isLoading ? (
            <div className="w-full space-y-12">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton
                        key={j}
                        className="h-[300px] w-1/4 rounded-2xl"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            collections.map((colType, index) => {
              const titleParts = formatTitle(colType);
              return (
                <motion.div
                  key={colType}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-full"
                >
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
                    collectionType={colType}
                    hideExploreLink={true}
                  />
                </motion.div>
              );
            })
          )}

          {/* ACCORDION PRODUSE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <AllProductsAccordion />
          </motion.div>
        </div>
      </main>

      <NewsletterPopup />
      <Footer />
    </div>
  );
};

export default Index;
