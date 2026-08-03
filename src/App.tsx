import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("@/pages/Index"));
const WeddingPage = lazy(() => import("@/pages/WeddingPage"));
const CoupleLogin = lazy(() => import("@/pages/CoupleLogin"));
const CoupleEntry = lazy(() => import("@/pages/CoupleEntry"));
const CoupleDashboard = lazy(() => import("@/pages/CoupleDashboard"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const WeddingCheckin = lazy(() => import("@/pages/WeddingCheckin"));
const QRRedirect = lazy(() => import("@/pages/QRRedirect"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wedding/:slug" element={<WeddingPage />} />
          <Route path="/couple/:slug" element={<CoupleEntry />} />
          <Route path="/couple/:slug/dashboard" element={<CoupleDashboard />} />
          <Route path="/couple-login" element={<CoupleLogin />} />
          <Route path="/couple-dashboard" element={<CoupleDashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/checkin/:slug" element={<WeddingCheckin />} />
          <Route path="/q/:slug" element={<QRRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
