import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import NetworkStatus from "@/components/NetworkStatus";

const Index = lazy(() => import("./pages/Index"));
const Explore = lazy(() => import("./pages/Explore"));
const WeddingsShowcase = lazy(() => import("./pages/WeddingsShowcase"));
const WeddingPage = lazy(() => import("./pages/WeddingPage"));
const WeddingCheckin = lazy(() => import("./pages/WeddingCheckin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminWeddingEditor = lazy(() => import("./pages/AdminWeddingEditor"));
const CoupleLogin = lazy(() => import("./pages/CoupleLogin"));
const CoupleDashboard = lazy(() => import("./pages/CoupleDashboard"));
const OnboardingWizard = lazy(() => import("./components/couple/OnboardingWizard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NetworkStatus />
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <p className="wedding-label">Loading...</p>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/weddings" element={<WeddingsShowcase />} />
                <Route path="/wedding/:slug" element={<WeddingPage />} />
                <Route path="/wedding/:slug/checkin" element={<WeddingCheckin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/wedding/:id" element={<AdminWeddingEditor />} />
                <Route path="/couple-login" element={<CoupleLogin />} />
                <Route path="/couple-dashboard" element={<CoupleDashboard />} />
                <Route path="/couple-onboarding" element={<OnboardingWizard />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
