import { createContext, useContext, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";

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
  const user = {
    id: "preview-admin",
    email: "preview@forevervow.local",
  } as User;
  const session = {
    access_token: "preview-token",
    user,
  } as Session;

  const signIn = async (email: string, password: string) => {
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    return { error: null };
  };

  const signOut = async () => {
    return;
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin: true, loading: false, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
