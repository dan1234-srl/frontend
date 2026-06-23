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

const SCROLL_KEY = "index:scrollY";
const COLLECTIONS_CACHE_KEY = "index:collections:order";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/ă/g, "a")
    .replace(/î/g, "i")
    .replace(/â/g, "a")
    .replace(/ș/g, "s")
    .replace(/ț/g, "t")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

const Index = () => {
  // Hidrăm instant ordinea colecțiilor din sessionStorage (doar pozițiile/structura,
  // datele propriu-zise se reîmprospătează din backend în fundal).
  const cachedOrder = (() => {
    try {
      const raw = sessionStorage.getItem(COLLECTIONS_CACHE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  })();

  const [collections, setCollections] = useState<string[]>(cachedOrder);
  const [isLoading, setIsLoading] = useState(cachedOrder.length === 0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/collections/`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCollections(list);
        setIsLoading(false);
        try {
          sessionStorage.setItem(COLLECTIONS_CACHE_KEY, JSON.stringify(list));
        } catch {}
      })
      .catch((err) => {
        console.error("Eroare la preluarea colecțiilor:", err);
        setIsLoading(false);
      });
  }, []);

  // Restaurare poziție scroll (per-tab) pentru navigarea înapoi/refresh.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const saved = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
    if (saved > 0) {
      // după primul paint pentru ca layoutul să existe
      requestAnimationFrame(() =>
        requestAnimationFrame(() => window.scrollTo(0, saved)),
      );
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

      {/* Spațiu controlat prin padding pe main, fără elemente spacer inutile */}
      <main className="flex-1 w-full relative pt-32 lg:pt-40">
        {/* CONTAINER 90% (max 1700px), gap redus la 8-12 pentru densitate */}
        <div className="w-[90%] max-w-[1700px] mx-auto flex flex-col gap-8 md:gap-12 pb-20">
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
              const collectionSlug = slugify(colType);

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
                    // 3. CONCRET: Trimiți slug-ul generat, NU valoarea brută
                    collectionType={collectionSlug}
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
