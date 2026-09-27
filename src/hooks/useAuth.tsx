import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const previewRequested = import.meta.env.VITE_PREVIEW_MODE === "true";
  if (import.meta.env.PROD && previewRequested) {
    throw new Error("VITE_PREVIEW_MODE cannot be enabled in a production build.");
  }
  const previewMode = import.meta.env.DEV && previewRequested;
  const [user, setUser] = useState<User | null>(previewMode ? ({ id: "preview-admin", email: "preview@forevervow.local" } as User) : null);
  const [session, setSession] = useState<Session | null>(previewMode ? ({ access_token: "preview-token", user } as Session) : null);
  const [loading, setLoading] = useState(!previewMode);
  const [isAdmin, setIsAdmin] = useState(previewMode);

  useEffect(() => {
    if (previewMode) return;
    let active = true;
    let roleRequest = 0;
    let receivedAuthEvent = false;
    const applySession = (nextSession: Session | null) => {
      const request = ++roleRequest;
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      setIsAdmin(false);
      setLoading(Boolean(nextUser));
      if (!nextUser) return;

      // Run after the auth callback releases Supabase's cross-tab lock.
      setTimeout(async () => {
        if (!active || request !== roleRequest) return;
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", nextUser.id)
            .eq("role", "admin")
            .maybeSingle();
          if (active && request === roleRequest) setIsAdmin(Boolean(data));
        } catch (error) {
          console.error("Could not load account role:", error);
        } finally {
          if (active && request === roleRequest) setLoading(false);
        }
      }, 0);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (active && !receivedAuthEvent) applySession(data.session);
    }).catch(() => {
      if (active && !receivedAuthEvent) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true;
      applySession(nextSession);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [previewMode]);

  const signIn = async (email: string, password: string) => {
    if (previewMode) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string) => {
    if (previewMode) return { error: null };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (!previewMode) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
