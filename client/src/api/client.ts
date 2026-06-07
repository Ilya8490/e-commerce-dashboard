import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const path = window.location.pathname;

      if (path !== "/login" && path !== "/register") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);
