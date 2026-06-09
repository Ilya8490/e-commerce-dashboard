import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { apiClient, clearStoredAuthToken, storeAuthToken } from "../api/client";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthResponse {
  user: AuthUser;
  token?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data.error ?? "Request failed";
  }

  return "Request failed";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiClient.get<AuthResponse>("/auth/me");
      return response.data.user;
    },
    retry: false
  });
  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await apiClient.post<AuthResponse>("/auth/login", payload);
      return response.data;
    },
    onSuccess: ({ token, user }) => {
      if (token) {
        storeAuthToken(token);
      }

      queryClient.setQueryData(["auth", "me"], user);
      navigate("/dashboard", { replace: true });
    }
  });
  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await apiClient.post<AuthResponse>("/auth/register", payload);
      return response.data;
    },
    onSuccess: ({ token, user }) => {
      if (token) {
        storeAuthToken(token);
      }

      queryClient.setQueryData(["auth", "me"], user);
      navigate("/dashboard", { replace: true });
    }
  });
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      clearStoredAuthToken();
      queryClient.removeQueries({ queryKey: ["auth"] });
      navigate("/login", { replace: true });
    }
  });
  const login = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation]
  );
  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerMutation.mutateAsync(payload);
    },
    [registerMutation]
  );
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);
  const authError = loginMutation.error
    ? getErrorMessage(loginMutation.error)
    : registerMutation.error
      ? getErrorMessage(registerMutation.error)
      : logoutMutation.error
        ? getErrorMessage(logoutMutation.error)
        : null;
  const user = meQuery.data ?? null;
  const isPublicAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: meQuery.isLoading && !isPublicAuthRoute,
      authError,
      login,
      register,
      logout
    }),
    [authError, isPublicAuthRoute, login, logout, meQuery.isLoading, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
