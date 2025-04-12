import { createContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../api/auth";

interface User {
  _id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const { data: userData } = await authApi.getCurrentUser();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data } = await authApi.register({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
