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
      {/* ── AMBIENT GLOWS PENTRU UN ASPECT PREMIUM ── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--royal-violet)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none -mt-40 -mr-40" />
      <div className="absolute top-[30%] left-0 w-[600px] h-[600px] bg-[var(--mauve-magic)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none -ml-40" />

      <Header />

      {/* Spațiere sub header (ajustată deoarece am eliminat voucherele) */}
      <div
        className="w-full h-[6rem] lg:h-[7rem] shrink-0"
        aria-hidden="true"
      />

      {/* ── TUBUL DE LAYOUT CENTRAL ── */}
      {/* Aici setăm o singură dată marginile laterale pentru TOATĂ pagina */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 relative z-10 flex flex-col gap-16 md:gap-24 pb-20">
        {/* 1. HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full"
        >
          <HomeHero />
        </motion.div>

        {/* 2. COLECȚII DINAMICE */}
        {isLoading ? (
          <div className="w-full space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-4">
                  <Skeleton className="h-[300px] w-1/4 rounded-2xl" />
                  <Skeleton className="h-[300px] w-1/4 rounded-2xl" />
                  <Skeleton className="h-[300px] w-1/4 rounded-2xl" />
                  <Skeleton className="h-[300px] w-1/4 rounded-2xl" />
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

        {/* 3. TOATE PRODUSELE (ACCORDION) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <AllProductsAccordion />
        </motion.div>
      </main>

      <NewsletterPopup />
      <Footer />
    </div>
  );
};

export default Index;
