import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "./useAuth";

type RoleResult = { data: { role: string } | null };
const authMock = vi.hoisted(() => ({
  onChange: null as null | ((event: string, session: Session | null) => void),
  requests: new Map<string, (result: RoleResult) => void>(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (callback: typeof authMock.onChange) => {
        authMock.onChange = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
    from: () => ({
      select: () => ({
        eq: (field: string, value: string) => ({
          eq: () => ({
            maybeSingle: () => new Promise<RoleResult>((resolve) => {
              if (field === "user_id") authMock.requests.set(value, resolve);
            }),
          }),
        }),
      }),
    }),
  },
}));

function AccountState() {
  const { user, isAdmin, loading } = useAuth();
  return <div>{`${user?.id ?? "none"}:${isAdmin}:${loading}`}</div>;
}

const sessionFor = (id: string) => ({ user: { id } } as Session);

afterEach(() => {
  cleanup();
  authMock.onChange = null;
  authMock.requests.clear();
});

describe("auth role lookup", () => {
  it("ignores a previous account's late admin result", async () => {
    render(<AuthProvider><AccountState /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("none:false:false")).toBeInTheDocument());

    act(() => authMock.onChange?.("SIGNED_IN", sessionFor("account-a")));
    await waitFor(() => expect(authMock.requests.has("account-a")).toBe(true));
    act(() => authMock.onChange?.("SIGNED_IN", sessionFor("account-b")));
    await waitFor(() => expect(authMock.requests.has("account-b")).toBe(true));

    act(() => authMock.requests.get("account-b")?.({ data: null }));
    await waitFor(() => expect(screen.getByText("account-b:false:false")).toBeInTheDocument());
    act(() => authMock.requests.get("account-a")?.({ data: { role: "admin" } }));
    expect(screen.getByText("account-b:false:false")).toBeInTheDocument();
  });
});
