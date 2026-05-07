import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, lazy, Suspense } from "react"; // Adăugat lazy și Suspense
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "./components/ScrollToTop";

// --- PAGINI PUBLICE (Lazy Loaded) ---
const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// --- PAGINI DESPRE (Lazy Loaded) ---
const OurStory = lazy(() => import("./pages/about/OurStory"));
const Sustainability = lazy(() => import("./pages/about/Sustainability"));
const SizeGuide = lazy(() => import("./pages/about/SizeGuide"));
const CustomerCare = lazy(() => import("./pages/about/CustomerCare"));
const StoreLocator = lazy(() => import("./pages/about/StoreLocator"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// --- AUTH & ACCOUNT (Lazy Loaded) ---
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Account = lazy(() => import("./pages/main/Account"));
const Orders = lazy(() => import("./pages/main/Orders"));
const Addresses = lazy(() => import("./pages/main/Addresses"));
const WebsiteSettings = lazy(() => import("./pages/main/Settings"));

// --- STRIPE (Lazy Loaded) ---
const SuccessPage = lazy(() => import("./pages/stripe/SuccessPage"));
const CancelPage = lazy(() => import("./pages/stripe/CancelPage"));

// --- ADMIN (Lazy Loaded - Aici economisești cel mai mult!) ---
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminAttributes = lazy(() => import("./pages/admin/AdminAttributes"));
const AdminExportFeed = lazy(() => import("./pages/admin/AdminExportFeed"));
const AdminImportFeed = lazy(() => import("./pages/admin/AdminImportFeed"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminWishlistAnalytics = lazy(
  () => import("./pages/admin/AdminWishlistAnalytics"),
);

const AdminEmailTemplates = lazy(
  () => import("./pages/admin/AdminEmailTemplates"),
);
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminThemeSettings = lazy(
  () => import("./pages/admin/AdminThemeSettings"),
);
const AdminGeneralSettings = lazy(
  () => import("./pages/admin/AdminGeneralSettings"),
);

const queryClient = new QueryClient();

// Loader subtil pentru tranziția între pagini
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
    <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
  </div>
);

const InitialLoader = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
  >
    <motion.h1
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-2xl font-light uppercase tracking-[0.5em] text-foreground"
    >
      Evem
    </motion.h1>
  </motion.div>
);

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsFirstLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isFirstLoad && <InitialLoader key="loader" />}
      </AnimatePresence>

      {/* Suspense oprește încărcarea admin-ului pe paginile de client */}
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <Index />
                </PageWrapper>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <PageWrapper>
                  <SuccessPage />
                </PageWrapper>
              }
            />
            <Route
              path="/order-canceled"
              element={
                <PageWrapper>
                  <CancelPage />
                </PageWrapper>
              }
            />
            <Route
              path="/category/:slug"
              element={
                <PageWrapper>
                  <CategoryPage />
                </PageWrapper>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <PageWrapper>
                  <ProductDetail />
                </PageWrapper>
              }
            />

            <Route path="/checkout" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />



            <Route
              path="/reset-password"
              element={
                <PageWrapper>
                  <ResetPassword />
                </PageWrapper>
              }
            />
            <Route
              path="/account/profile"
              element={
                <PageWrapper>
                  <Account />
                </PageWrapper>
              }
            />
            <Route
              path="/account/addresses"
              element={
                <PageWrapper>
                  <Addresses />
                </PageWrapper>
              }
            />
            <Route
              path="/account/orders"
              element={
                <PageWrapper>
                  <Orders />
                </PageWrapper>
              }
            />
            <Route
              path="/settings"
              element={
                <PageWrapper>
                  <WebsiteSettings />
                </PageWrapper>
              }
            />

            {/* Admin Routes - Codul pentru acestea se va descărca DOAR dacă intri pe /admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route
                path="wishlist-analytics"
                element={<AdminWishlistAnalytics />}
              />
              <Route path="theme" element={<AdminThemeSettings />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="attributes" element={<AdminAttributes />} />
              <Route path="import" element={<AdminImportFeed />} />
              <Route path="export" element={<AdminExportFeed />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="email-templates" element={<AdminEmailTemplates />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="settings" element={<AdminGeneralSettings />} />
            </Route>

            <Route
              path="/about/our-story"
              element={
                <PageWrapper>
                  <OurStory />
                </PageWrapper>
              }
            />
            <Route
              path="/about/sustainability"
              element={
                <PageWrapper>
                  <Sustainability />
                </PageWrapper>
              }
            />
            <Route
              path="/about/size-guide"
              element={
                <PageWrapper>
                  <SizeGuide />
                </PageWrapper>
              }
            />
            <Route
              path="/about/customer-care"
              element={
                <PageWrapper>
                  <CustomerCare />
                </PageWrapper>
              }
            />
            <Route
              path="/about/store-locator"
              element={
                <PageWrapper>
                  <StoreLocator />
                </PageWrapper>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PageWrapper>
                  <PrivacyPolicy />
                </PageWrapper>
              }
            />
            <Route
              path="/terms-of-service"
              element={
                <PageWrapper>
                  <TermsOfService />
                </PageWrapper>
              }
            />
            <Route
              path="*"
              element={
                <PageWrapper>
                  <NotFound />
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-center" expand={false} richColors />
              <BrowserRouter>
                <ScrollToTop />
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
