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

import { CommandPalette } from "@/components/ui/CommandPalette";

function LegacyCoupleDashboardRedirect() {
  const slug = localStorage.getItem("couple_wedding_slug") || sessionStorage.getItem("couple_wedding_slug");
  if (!slug) return <Navigate to="/admin/login" replace />;
  return <Navigate to={`/couple/${slug}/dashboard`} replace />;
}

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0C0A09]">
    <div className="text-center relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#D4A853]/10 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 mb-5 border-2 border-[#D4A853]/20 border-t-[#D4A853] rounded-full animate-spin" />
        <div className="text-[#D4A853] text-[11px] tracking-[0.3em] uppercase font-semibold font-mono">
          Loading ForeverVow
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        theme="dark" 
        richColors 
        toastOptions={{
          style: {
            background: "rgba(12, 10, 9, 0.88)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212, 168, 83, 0.2)",
            color: "#FAF7F2",
            fontFamily: '"DM Sans", sans-serif',
          }
        }}
      />
      <CommandPalette />
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
