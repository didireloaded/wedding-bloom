import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import SectionErrorBoundary from "./components/SectionErrorBoundary.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <SectionErrorBoundary fallback={
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#111111] px-6 text-center text-white">
      <h1 className="font-body text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm font-body text-sm text-white/70">Reload the page to try again.</p>
      <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-full bg-[#ff6245] px-6 font-body text-sm font-semibold text-black">Reload</button>
    </main>
  }>
    <App />
  </SectionErrorBoundary>,
);

// Register service worker for PWA offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
