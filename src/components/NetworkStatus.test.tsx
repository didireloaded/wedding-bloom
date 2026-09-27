import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NetworkStatus from "./NetworkStatus";

describe("network status", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps the offline warning visible until connectivity returns", () => {
    render(<NetworkStatus />);
    expect(screen.queryByRole("status")).toBeNull();
    act(() => window.dispatchEvent(new Event("offline")));
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("status")).toHaveTextContent("You are offline.");
    act(() => window.dispatchEvent(new Event("online")));
    expect(screen.getByRole("status")).toHaveTextContent("Back online");
    act(() => vi.advanceTimersByTime(3_000));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("resets the dismissal timer on repeated reconnect events", () => {
    render(<NetworkStatus />);
    act(() => window.dispatchEvent(new Event("online")));
    act(() => vi.advanceTimersByTime(2_000));
    act(() => window.dispatchEvent(new Event("online")));
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole("status")).toHaveTextContent("Back online");
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
