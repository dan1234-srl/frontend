import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
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
import { FiltersProvider } from "@/contexts/FiltersContext";
import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import { prefetchCriticalRoutes } from "@/lib/route-prefetch";

// ─── Public (lazy) ───
const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ─── About (lazy) ───
const OurStory = lazy(() => import("./pages/about/OurStory"));
const Sustainability = lazy(() => import("./pages/about/Sustainability"));
const SizeGuide = lazy(() => import("./pages/about/SizeGuide"));
const CustomerCare = lazy(() => import("./pages/about/CustomerCare"));
const StoreLocator = lazy(() => import("./pages/about/StoreLocator"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

// ─── Auth & Account (lazy) ───
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Account = lazy(() => import("./pages/main/Account"));
const Orders = lazy(() => import("./pages/main/Orders"));
const Addresses = lazy(() => import("./pages/main/Addresses"));

// ─── Stripe (lazy) ───
const SuccessPage = lazy(() => import("./pages/stripe/SuccessPage"));
const CancelPage = lazy(() => import("./pages/stripe/CancelPage"));

// ─── Admin (lazy) ───
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
const CollectionsAdmin = lazy(() => import("./pages/admin/CollectionsAdmin"));
import Faq from "./pages/Faq"; // Ajustează calea către fișier dacă e diferită
import Contact from "./pages/Contact";
import AdminProductEdit from "./pages/admin/AdminProductEdit";

const AdminWishlistAnalytics = lazy(
  () => import("./pages/admin/AdminWishlistAnalytics"),
);
const AdminEmailTemplates = lazy(
  () => import("./pages/admin/AdminEmailTemplates"),
);
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail")); // 🚀 ADĂUGAȚI ASTA

const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminThemeSettings = lazy(
  () => import("./pages/admin/AdminThemeSettings"),
);
const AdminGeneralSettings = lazy(
  () => import("./pages/admin/AdminGeneralSettings"),
);
const AdminGLS = lazy(() => import("./pages/admin/AdminGLS"));

// Single Query Client now lives in src/lib/query-client.ts so cache-busting
// utilities (used by the admin) can invalidate the same instance.

// Minimal fallback: doar un puls subtil, fără overlay full-screen (zero blocking paint).
const PageLoader = () => (
  <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] overflow-hidden">
    <div className="h-full w-1/3 bg-zinc-900 animate-[shimmer_1.2s_ease-in-out_infinite]" />
  </div>
);

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
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
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={isAdmin ? "admin" : location.pathname}>
          {/* ── Admin (fără animation per-route, doar layout share) ── */}
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
            <Route path="products/:sku" element={<AdminProductEdit />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="attributes" element={<AdminAttributes />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="collections" element={<CollectionsAdmin />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="email-templates" element={<AdminEmailTemplates />} />
            <Route
              path="wishlist-analytics"
              element={<AdminWishlistAnalytics />}
            />
            <Route path="import" element={<AdminImportFeed />} />
            <Route path="export" element={<AdminExportFeed />} />
            <Route path="theme" element={<AdminThemeSettings />} />
            <Route path="settings" element={<AdminGeneralSettings />} />
            <Route path="gls" element={<AdminGLS />} />
          </Route>

          {/* ── Public ── */}
          <Route
            path="/"
            element={
              <PageWrapper>
                <Index />
              </PageWrapper>
            }
          />
          <Route
            path="/faq"
            element={
              <PageWrapper>
                <Faq />
              </PageWrapper>
            }
          />

          <Route
            path="/contact"
            element={
              <PageWrapper>
                <Contact />
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
          <Route
            path="/reset-password"
            element={
              <PageWrapper>
                <ResetPassword />
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
            path="/account/settings"
            element={
              <PageWrapper>
                <Account />
              </PageWrapper>
            }
          />
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
            path="/return-policy"
            element={
              <PageWrapper>
                <ReturnPolicy />
              </PageWrapper>
            }
          />
          <Route
            path="/cookie-policy"
            element={
              <PageWrapper>
                <CookiePolicy />
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
  );
};

const App = () => {
  useEffect(() => {
    prefetchCriticalRoutes();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <FiltersProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <AnimatedRoutes />
                  </BrowserRouter>
                </TooltipProvider>
              </FiltersProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
