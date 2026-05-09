"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { clearStoredAccessToken, getStoredAccessToken, persistAccessToken } from "../../lib/auth";
import { ApiError, buyerApi } from "../../lib/api";
import type { BuyerAuthUser, BuyerLoginResponse } from "../../lib/types";

type AuthContextValue = {
  user: BuyerAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  setSession: (loginResponse: BuyerLoginResponse) => void;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BuyerAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  async function refreshSession() {
    const storedToken = getStoredAccessToken();
    if (!storedToken) {
      startTransition(() => {
        setToken(null);
        setUser(null);
        setIsRestoring(false);
      });
      return;
    }

    try {
      const nextUser = await buyerApi.getCurrentUser(storedToken);
      startTransition(() => {
        setToken(storedToken);
        setUser(nextUser);
        setIsRestoring(false);
      });
    } catch (error) {
      clearStoredAccessToken();
      startTransition(() => {
        setToken(null);
        setUser(null);
        setIsRestoring(false);
      });

      if (!(error instanceof ApiError) || error.status >= 500) {
        throw error;
      }
    }
  }

  useEffect(() => {
    void refreshSession().catch(() => {});
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isRestoring,
      setSession: (loginResponse) => {
        persistAccessToken(loginResponse.accessToken);
        startTransition(() => {
          setToken(loginResponse.accessToken);
          setUser(loginResponse.user);
          setIsRestoring(false);
        });
      },
      refreshSession,
      logout: async () => {
        const currentToken = getStoredAccessToken();

        try {
          if (currentToken) {
            await buyerApi.logout(currentToken);
          }
        } catch {
          // Always clear the local session even if the backend token is already invalid.
        } finally {
          clearStoredAccessToken();
          startTransition(() => {
            setToken(null);
            setUser(null);
            setIsRestoring(false);
          });
        }
      },
    }),
    [isRestoring, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
