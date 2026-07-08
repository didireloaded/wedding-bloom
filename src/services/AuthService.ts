import { supabase } from "@/lib/supabase";
import { WeddingRepository } from "@/repositories";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "couple" | "guest";

export interface CoupleAccessVerification {
  id: string;
  slug: string;
  couple_names: string;
}

class AuthDomainService {
  private weddingRepo = new WeddingRepository();

  async signInWithPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, session: null, error: error.message };
      return { user: data.user, session: data.session, error: null };
    } catch (err: any) {
      return { user: null, session: null, error: err?.message || "Sign in failed" };
    }
  }

  async signInWithMagicLink(email: string, redirectTo?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || (typeof window !== "undefined" ? window.location.origin : ""),
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || "Magic link request failed" };
    }
  }

  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || (typeof window !== "undefined" ? window.location.origin + "/reset-password" : ""),
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || "Password reset request failed" };
    }
  }

  async verifyOtp(email: string, token: string, type: "magiclink" | "recovery" | "signup" | "email"): Promise<{ session: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      if (error) return { session: null, error: error.message };
      return { session: data.session, error: null };
    } catch (err: any) {
      return { session: null, error: err?.message || "OTP verification failed" };
    }
  }

  async signOut(): Promise<{ success: boolean; error: string | null }> {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("couple_wedding_id");
        sessionStorage.removeItem("couple_wedding_slug");
        localStorage.removeItem("couple_wedding_id");
        localStorage.removeItem("couple_wedding_slug");
      }
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || "Sign out failed" };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async checkUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { data: hasRole, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: role,
      });
      if (error) return false;
      return !!hasRole;
    } catch {
      return false;
    }
  }

  async verifyCoupleAccessCode(accessCode: string): Promise<{ data: CoupleAccessVerification | null; error: string | null }> {
    try {
      const normalized = accessCode.trim().toUpperCase();
      const { data, error } = await supabase.rpc("verify_couple_access", { p_access_code: normalized });
      if (error) return { data: null, error: error.message };
      if (!data) return { data: null, error: "Invalid access code" };

      const verification = data as CoupleAccessVerification;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("couple_wedding_id", verification.id);
        sessionStorage.setItem("couple_wedding_slug", verification.slug);
        localStorage.setItem("couple_wedding_id", verification.id);
        localStorage.setItem("couple_wedding_slug", verification.slug);
      }
      return { data: verification, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || "Verification failed" };
    }
  }

  async verifyCoupleSessionForSlug(slug: string): Promise<boolean> {
    try {
      // 1. Check if user is an authenticated Admin or Couple in Supabase Auth
      const user = await this.getCurrentUser();
      if (user) {
        const isAdmin = await this.checkUserRole(user.id, "admin");
        if (isAdmin) return true; // Admins can view any wedding workspace

        const isCouple = await this.checkUserRole(user.id, "couple");
        if (isCouple) {
          // Check if this user is assigned to this wedding slug in user metadata or weddings table
          const { data: wedding } = await this.weddingRepo.findBySlug(slug);
          if (wedding && (user.id === wedding.id || (user.user_metadata && user.user_metadata.wedding_slug === slug))) {
            return true;
          }
        }
      }

      // 2. Check if browser has verified couple access code token for this slug
      if (typeof window !== "undefined") {
        const storedSlug = sessionStorage.getItem("couple_wedding_slug") || localStorage.getItem("couple_wedding_slug");
        const storedId = sessionStorage.getItem("couple_wedding_id") || localStorage.getItem("couple_wedding_id");
        if (storedSlug === slug && storedId) {
          // Verify against database that the wedding actually exists and matches storedId
          const { data: wedding } = await this.weddingRepo.findBySlug(slug);
          if (wedding && wedding.id === storedId) {
            return true;
          }
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  // ── ARCHITECTURAL SAFETY: TIMEOUT-PROTECTED METHODS ──
  // Prevents infinite loading screens when network or Supabase latency occurs.

  async getSessionWithTimeout(timeoutMs = 2500): Promise<Session | null> {
    try {
      return await Promise.race([
        supabase.auth.getSession().then(({ data }) => data.session),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
      ]);
    } catch {
      return null;
    }
  }

  async getUserWithTimeout(timeoutMs = 2500): Promise<User | null> {
    try {
      return await Promise.race([
        supabase.auth.getUser().then(({ data }) => data.user),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
      ]);
    } catch {
      return null;
    }
  }

  async checkUserRoleWithTimeout(userId: string, role: UserRole, timeoutMs = 2500): Promise<boolean> {
    try {
      return await Promise.race([
        this.checkUserRole(userId, role),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs))
      ]);
    } catch {
      return false;
    }
  }

  async verifyCoupleSessionForSlugWithTimeout(slug: string, timeoutMs = 2500): Promise<boolean> {
    try {
      return await Promise.race([
        this.verifyCoupleSessionForSlug(slug),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs))
      ]);
    } catch {
      return false;
    }
  }
}

export const AuthService = new AuthDomainService();
