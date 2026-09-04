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
  const previewMode = import.meta.env.VITE_PREVIEW_MODE === "true";
  const [user, setUser] = useState<User | null>(previewMode ? ({ id: "preview-admin", email: "preview@forevervow.local" } as User) : null);
  const [session, setSession] = useState<Session | null>(previewMode ? ({ access_token: "preview-token", user } as Session) : null);
  const [loading, setLoading] = useState(!previewMode);

  useEffect(() => {
    if (previewMode) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
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
    <AuthContext.Provider value={{ user, session, isAdmin: previewMode, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
