import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import { MemoryRouter } from "react-router-dom";

describe("MobileBottomNav", () => {
  it("renders provided items as labels", () => {
    render(
      <MemoryRouter>
        <MobileBottomNav
          items={[
            { id: "home", label: "Home", icon: <span>H</span>, onClick: () => {} },
            { id: "menu", label: "Menu", icon: <span>M</span>, onClick: () => {} },
          ]}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });
});
