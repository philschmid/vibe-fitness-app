import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { STORAGE_KEYS } from "../constants";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const cached = localStorage.getItem("vibe_auth_session");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User | null>(() => session?.user ?? null);
  const [loading, setLoading] = useState(() => !session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) {
        localStorage.setItem("vibe_auth_session", JSON.stringify(session));
      } else {
        localStorage.removeItem("vibe_auth_session");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) {
        localStorage.setItem("vibe_auth_session", JSON.stringify(session));
      } else {
        localStorage.removeItem("vibe_auth_session");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Use explicit redirect URL from env if available, otherwise current origin
    const redirectTo =
      import.meta.env.VITE_AUTH_REDIRECT_URL ?? window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
