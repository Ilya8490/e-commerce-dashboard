import axios from "axios";

const authTokenStorageKey = "ecommerce_dashboard_auth_token";

function readStoredAuthToken() {
  try {
    return window.localStorage.getItem(authTokenStorageKey);
  } catch {
    return null;
  }
}

export function storeAuthToken(token: string) {
  try {
    window.localStorage.setItem(authTokenStorageKey, token);
  } catch {
    // The httpOnly cookie remains the primary auth transport when storage is unavailable.
  }
}

export function clearStoredAuthToken() {
  try {
    window.localStorage.removeItem(authTokenStorageKey);
  } catch {
    // Nothing to clear when browser storage is unavailable.
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = readStoredAuthToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredAuthToken();
      const path = window.location.pathname;

      if (path !== "/login" && path !== "/register") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);
