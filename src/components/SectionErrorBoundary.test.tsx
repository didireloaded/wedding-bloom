import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionErrorBoundary from "./SectionErrorBoundary";

afterEach(() => vi.restoreAllMocks());

describe("SectionErrorBoundary", () => {
  it("shows a fallback when a child crashes during render", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Broken = () => { throw new Error("render failed"); };

    render(
      <SectionErrorBoundary fallback={<p>Try again</p>}>
        <Broken />
      </SectionErrorBoundary>,
    );

    expect(screen.getByText("Try again")).toBeTruthy();
  });
});
