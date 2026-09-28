import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileChallenge({ siteKey, onToken }: { siteKey: string; onToken: (token: string | null) => void }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widgetId: string | undefined;
    let active = true;
    const render = () => {
      if (!active || !container.current || !container.current.getClientRects().length || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(container.current, {
        sitekey: siteKey,
        action: "wedding_rsvp",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };
    let script = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    const observer = new IntersectionObserver(render);
    if (container.current) observer.observe(container.current);
    render();
    return () => {
      active = false;
      observer.disconnect();
      script?.removeEventListener("load", render);
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, onToken]);

  return <div ref={container} aria-label="Verify RSVP submission" />;
}
