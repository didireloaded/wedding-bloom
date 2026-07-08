import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedCoupleRoute } from "./ProtectedCoupleRoute";
import { AuthService } from "@/services";

vi.mock("@/services", () => ({
  AuthService: {
    verifyCoupleSessionForSlug: vi.fn(),
    verifyCoupleSessionForSlugWithTimeout: vi.fn(),
  },
}));

function renderWithRouter(slug: string, isAuthorized: boolean | Promise<boolean>) {
  vi.mocked(AuthService.verifyCoupleSessionForSlug).mockImplementation(() => Promise.resolve(isAuthorized));
  vi.mocked(AuthService.verifyCoupleSessionForSlugWithTimeout).mockImplementation(() => Promise.resolve(isAuthorized));

  return render(
    <MemoryRouter initialEntries={[`/couple/${slug}/dashboard`]}>
      <Routes>
        <Route
          path="/couple/:slug/dashboard"
          element={
            <ProtectedCoupleRoute>
              <div data-testid="protected-couple-content">Couple Dashboard Content</div>
            </ProtectedCoupleRoute>
          }
        />
        <Route path="/couple-login" element={<div data-testid="login-redirect">Couple Login Portal</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedCoupleRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user has verified session for slug", async () => {
    renderWithRouter("elena-marcus-2026", true);

    await waitFor(() => {
      expect(screen.getByTestId("protected-couple-content")).toBeInTheDocument();
    });
  });

  it("redirects to /couple-login when session is not verified or unauthorized", async () => {
    renderWithRouter("elena-marcus-2026", false);

    await waitFor(() => {
      expect(screen.getByTestId("login-redirect")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-couple-content")).not.toBeInTheDocument();
    });
  });
});
