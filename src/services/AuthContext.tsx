import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { invoke } from "@tauri-apps/api/core";
import { authStorage } from "./auth-storage";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface LoginRequest {
  user_name: string;
  password: string;
}

interface AuthSession {
  token: string;
  user: User;
  expires_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    userName: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    restoreSession();

  }, []);

  const restoreSession = async () => {

    try {

      const token =
        authStorage.getToken();

      if (!token) {
        return;
      }

      const currentUser =
        await invoke<User>(
          "get_current_user_cmd",
          {
            token,
          }
        );

      setUser(currentUser);

    } catch (error) {

      console.error(
        "Session invalide :",
        error
      );

      authStorage.clearToken();

      setUser(null);

    } finally {

      setLoading(false);
    }
  };

  const login = async (
    userName: string,
    password: string
  ) => {

    const data: LoginRequest = {
      user_name: userName.trim(),
      password,
    };

    const session =
      await invoke<AuthSession>(
        "authenticate_cmd",
        {
          data,
        }
      );

    authStorage.setToken(
      session.token
    );

    setUser(session.user);
  };

  const logout = async () => {

    const token =
      authStorage.getToken();

    try {

      if (token) {

        await invoke(
          "logout_cmd",
          {
            token,
          }
        );
      }

    } finally {

      authStorage.clearToken();

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider"
    );
  }

  return context;
}