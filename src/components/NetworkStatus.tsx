import { useEffect, useState } from "react";
import { CloudOff, Wifi } from "lucide-react";

const NetworkStatus = () => {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const offline = () => { window.clearTimeout(timer); setOnline(false); setShowRestored(false); };
    const restored = () => {
      setOnline(true);
      setShowRestored(true);
      timer = window.setTimeout(() => setShowRestored(false), 3_000);
    };
    window.addEventListener("offline", offline);
    window.addEventListener("online", restored);
    return () => { window.clearTimeout(timer); window.removeEventListener("offline", offline); window.removeEventListener("online", restored); };
  }, []);

  if (online && !showRestored) return null;
  return (
    <div role="status" aria-live="polite" className={`fixed left-1/2 top-[max(12px,env(safe-area-inset-top))] z-[100] flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-semibold shadow-lg ${online ? "bg-[#b2dc6b] text-black" : "bg-[#202020] text-white"}`}>
      {online ? <Wifi className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
      {online ? "Back online" : "You are offline. Unsaved actions may need to be retried."}
    </div>
  );
};

export default NetworkStatus;
