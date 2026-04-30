import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "../lib/mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("lista_auth");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("lista_auth", JSON.stringify(user));
    } else {
      localStorage.removeItem("lista_auth");
    }
  }, [user]);

  const login = (email: string, role: UserRole) => {
    setUser({
      id: "u" + Date.now(),
      name: email.split("@")[0] || "User",
      email,
      role,
      avatarUrl: ""
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
