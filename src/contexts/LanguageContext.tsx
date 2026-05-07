import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ro" | "en";

interface Translations {
  [key: string]: { ro: string; en: string };
}

const translations: Translations = {
  // Nav
  "nav.shop": { ro: "Magazin", en: "Shop" },
  "nav.new_in": { ro: "Noutăți", en: "New In" },
  "nav.about": { ro: "Despre", en: "About" },
  "nav.search": { ro: "Caută", en: "Search" },
  "nav.favorites": { ro: "Favorite", en: "Favorites" },
  "nav.account": { ro: "Cont", en: "Account" },
  "nav.login": { ro: "Autentificare", en: "Login" },

  // Shop submenu
  "nav.rings": { ro: "Inele", en: "Rings" },
  "nav.necklaces": { ro: "Coliere", en: "Necklaces" },
  "nav.earrings": { ro: "Cercei", en: "Earrings" },
  "nav.bracelets": { ro: "Brățări", en: "Bracelets" },
  "nav.watches": { ro: "Ceasuri", en: "Watches" },

  // New in submenu
  "nav.this_weeks_arrivals": { ro: "Sosiri din această săptămână", en: "This Week's Arrivals" },
  "nav.spring_collection": { ro: "Colecția de primăvară", en: "Spring Collection" },
  "nav.featured_designers": { ro: "Designeri selectați", en: "Featured Designers" },
  "nav.limited_edition": { ro: "Ediție limitată", en: "Limited Edition" },
  "nav.pre_orders": { ro: "Pre-comenzi", en: "Pre-Orders" },

  // About submenu
  "nav.our_story": { ro: "Povestea noastră", en: "Our Story" },
  "nav.sustainability": { ro: "Sustenabilitate", en: "Sustainability" },
  "nav.size_guide": { ro: "Ghid mărimi", en: "Size Guide" },
  "nav.customer_care": { ro: "Asistență clienți", en: "Customer Care" },
  "nav.store_locator": { ro: "Localizator magazine", en: "Store Locator" },

  // Search
  "search.placeholder": { ro: "Caută bijuterii...", en: "Search for jewelry..." },
  "search.popular": { ro: "Căutări populare", en: "Popular Searches" },
  "search.gold_rings": { ro: "Inele de aur", en: "Gold Rings" },
  "search.silver_necklaces": { ro: "Coliere de argint", en: "Silver Necklaces" },
  "search.pearl_earrings": { ro: "Cercei cu perle", en: "Pearl Earrings" },
  "search.designer_bracelets": { ro: "Brățări designer", en: "Designer Bracelets" },
  "search.wedding_rings": { ro: "Verighete", en: "Wedding Rings" },
  "search.vintage_collection": { ro: "Colecție vintage", en: "Vintage Collection" },

  // Shopping bag
  "bag.title": { ro: "Coș de cumpărături", en: "Shopping Bag" },
  "bag.empty": { ro: "Coșul tău este gol.\nContinuă cumpărăturile pentru a adăuga produse.", en: "Your shopping bag is empty.\nContinue shopping to add items to your bag." },
  "bag.subtotal": { ro: "Subtotal", en: "Subtotal" },
  "bag.shipping_note": { ro: "Livrarea și taxele se calculează la checkout", en: "Shipping and taxes calculated at checkout" },
  "bag.checkout": { ro: "Finalizează comanda", en: "Proceed to Checkout" },
  "bag.continue": { ro: "Continuă cumpărăturile", en: "Continue Shopping" },
  "bag.view_favorites": { ro: "Vezi favoritele", en: "View Favorites" },

  // Favorites
  "favorites.title": { ro: "Favoritele tale", en: "Your Favorites" },
  "favorites.empty": { ro: "Nu ai adăugat încă favorite. Răsfoiește colecția noastră și apasă pe iconița inimă pentru a salva articolele preferate.", en: "You haven't added any favorites yet. Browse our collection and click the heart icon to save items you love." },

  // Status bar
  "status.free_shipping": { ro: "Livrare gratuită peste €50", en: "Free shipping over €50" },
  "status.warranty": { ro: "Garanție 365 de zile", en: "365 days warranty" },
  "status.happy_customers": { ro: "+100.000 clienți mulțumiți", en: "+100,000 happy customers" },

  // Dropdown labels
  "nav.read_our_story": { ro: "Citește povestea noastră", en: "Read our story" },

  // Language
  "lang.ro": { ro: "RO", en: "RO" },
  "lang.en": { ro: "EN", en: "EN" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("linea-lang");
    return (saved === "en" || saved === "ro") ? saved : "ro";
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("linea-lang", lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
