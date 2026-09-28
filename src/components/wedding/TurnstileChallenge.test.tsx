import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TurnstileChallenge from "./TurnstileChallenge";

describe("RSVP challenge", () => {
  let notifyVisibility: (() => void) | undefined;
  const renderWidget = vi.fn((_element: HTMLElement, _options: Record<string, unknown>) => "widget-1");
  const removeWidget = vi.fn();

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([] as unknown as DOMRectList);
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: () => void) { notifyVisibility = callback; }
      observe() {}
      disconnect() {}
    });
    window.turnstile = { render: renderWidget, remove: removeWidget };
  });

  afterEach(() => {
    cleanup();
    document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')?.remove();
    delete window.turnstile;
    notifyVisibility = undefined;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    renderWidget.mockClear();
    removeWidget.mockClear();
  });

  it("waits for the hidden RSVP tab and invalidates expired tokens", () => {
    const onToken = vi.fn();
    const view = render(<TurnstileChallenge siteKey="test-site-key" onToken={onToken} />);
    expect(renderWidget).not.toHaveBeenCalled();
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    act(() => notifyVisibility?.());
    expect(renderWidget).toHaveBeenCalledTimes(1);
    const options = renderWidget.mock.calls[0][1];
    expect(options.action).toBe("wedding_rsvp");
    act(() => (options.callback as (token: string) => void)("verified-token"));
    expect(onToken).toHaveBeenLastCalledWith("verified-token");
    act(() => (options["expired-callback"] as () => void)());
    expect(onToken).toHaveBeenLastCalledWith(null);
    view.unmount();
    expect(removeWidget).toHaveBeenCalledWith("widget-1");
  });
});
