import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8002";

const Category = () => {
  const { category: slug } = useParams();
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/products/?category_slug=${slug}`,
          {
            method: "GET",
            // ADAUGAT: Permite trimiterea cookie-ului HTTP-Only dacă utilizatorul este autentificat
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Data received is not an array:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Eroare la încărcarea produselor:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProducts();
    }
  }, [slug]);

  const displayTitle = slug
    ? decodeURIComponent(slug).replace(/-/g, " ")
    : "Toate Produsele";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24 animate-in fade-in duration-1000">
        <CategoryHeader category={displayTitle} />

        <FilterSortBar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={products.length}
        />

        {/* ProductGrid va primi lista de produse, indiferent dacă ești logat sau nu */}
        <ProductGrid products={products} loading={loading} />
      </main>

      <Footer />
    </div>
  );
};

export default Category;
