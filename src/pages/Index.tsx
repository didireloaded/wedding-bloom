import { Navigate } from "react-router-dom";

export default function Index() {
  const adminLoggedIn = localStorage.getItem("wb_admin") || sessionStorage.getItem("wb_admin");
  const coupleSlug = localStorage.getItem("couple_wedding_slug") || sessionStorage.getItem("couple_wedding_slug");

  if (adminLoggedIn) return <Navigate to="/admin-dashboard" replace />;
  if (coupleSlug) return <Navigate to={`/couple/${coupleSlug}`} replace />;

  // ForeverVow has no universal home screen. Each role enters through its own URL.
  return <Navigate to="/admin/login" replace />;
}