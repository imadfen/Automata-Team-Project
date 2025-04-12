import { api } from "./config";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    _id: string;
    email: string;
  };
  token: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/login", credentials),

  register: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/register", credentials),

  getCurrentUser: () => api.get("/auth/me"),
};
