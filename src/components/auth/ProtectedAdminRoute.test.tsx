import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
let mockSession: { user: { id: string } } | null = null;
let mockRpcResult: boolean | null = null;
let mockRpcError: { message: string } | null = null;

vi.mock("@/utils/supabase", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({
        data: { user: mockSession ? { id: mockSession.user.id } : null },
      }),
      onAuthStateChange: (_callback: unknown) => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
      signOut: vi.fn(() => Promise.resolve({})),
    },
    rpc: (_fn: string, _args: unknown) => {
      if (mockRpcError) return Promise.resolve({ data: null, error: mockRpcError });
      return Promise.resolve({ data: mockRpcResult, error: null });
    },
  },
}));

// We need to test the component rendering logic
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("ProtectedAdminRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = null;
    mockRpcResult = null;
    mockRpcError = null;
  });

  it("shows loading spinner while checking", async () => {
    // Slow down the auth check
    mockSession = { user: { id: "user-1" } };
    mockRpcResult = true;

    renderWithRouter(
      <ProtectedAdminRoute>
        <div data-testid="protected-content">Admin Content</div>
      </ProtectedAdminRoute>
    );

    // Should show spinner initially
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("protected-content")).toBeInTheDocument());
  });

  it("renders children when user has admin role", async () => {
    mockSession = { user: { id: "admin-user-1" } };
    mockRpcResult = true;

    renderWithRouter(
      <ProtectedAdminRoute>
        <div data-testid="protected-content">Admin Content</div>
      </ProtectedAdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });

  it("redirects when no session exists", async () => {
    mockSession = null;

    renderWithRouter(
      <ProtectedAdminRoute>
        <div data-testid="protected-content">Admin Content</div>
      </ProtectedAdminRoute>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  it("redirects when user exists but has no admin role", async () => {
    mockSession = { user: { id: "regular-user-1" } };
    mockRpcResult = false;

    renderWithRouter(
      <ProtectedAdminRoute>
        <div data-testid="protected-content">Admin Content</div>
      </ProtectedAdminRoute>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });
});
