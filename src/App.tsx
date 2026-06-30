import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const Index = lazy(() => import("@/pages/Index"));
const WeddingPage = lazy(() => import("@/pages/WeddingPage"));
const CoupleEntry = lazy(() => import("@/pages/CoupleEntry"));
const CoupleDashboard = lazy(() => import("@/pages/CoupleDashboard"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const WeddingBuilder = lazy(() => import("@/pages/WeddingBuilder"));
const WeddingCheckin = lazy(() => import("@/pages/WeddingCheckin"));
const QRRedirect = lazy(() => import("@/pages/QRRedirect"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function LegacyCoupleDashboardRedirect() {
  const slug = localStorage.getItem("couple_wedding_slug") || sessionStorage.getItem("couple_wedding_slug");
  if (!slug) return <Navigate to="/admin/login" replace />;
  return <Navigate to={`/couple/${slug}/dashboard`} replace />;
}

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#c9a87a] border-t-transparent rounded-full animate-spin"></div>
      <div className="text-[#8d7962] text-sm tracking-[0.18em] uppercase">Loading</div>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="light" richColors />
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wedding/:slug" element={<WeddingPage />} />
            <Route path="/couple/:slug" element={<CoupleEntry />} />
            <Route path="/couple/:slug/dashboard" element={<CoupleDashboard />} />
            <Route path="/couple-login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/couple-dashboard" element={<LegacyCoupleDashboardRedirect />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/builder" element={<WeddingBuilder />} />
            <Route path="/builder" element={<WeddingBuilder />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/checkin/:slug" element={<WeddingCheckin />} />
            <Route path="/q/:slug" element={<QRRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
