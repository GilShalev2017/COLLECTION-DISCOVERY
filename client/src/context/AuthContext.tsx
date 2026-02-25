/**
 * AuthContext
 *
 * Provides the current user (from JWT stored in localStorage)
 * to the entire app. Exposes login, logout, and register helpers.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  museumId: string;
  museumName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  museumName: string;
  museumSlug: string;
  email: string;
  password: string;
  name: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount while we check localStorage

  // On mount: restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("tema_token");
    const storedUser = localStorage.getItem("tema_user");
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("tema_token", data.token);
    localStorage.setItem("tema_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (formData: RegisterData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("tema_token", data.token);
    localStorage.setItem("tema_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("tema_token");
    localStorage.removeItem("tema_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
