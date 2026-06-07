import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./layout/AppLayout";
import {
  CustomersPage,
  DashboardPage,
  FunnelPage,
  ProductsPage,
  TrafficPage
} from "./pages/AppPages";
import { LoginPage, RegisterPage } from "./pages/AuthPages";

export function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/dashboard" />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<DashboardPage />} path="/dashboard" />
          <Route element={<ProductsPage />} path="/products" />
          <Route element={<FunnelPage />} path="/funnel" />
          <Route element={<TrafficPage />} path="/traffic" />
          <Route element={<CustomersPage />} path="/customers" />
        </Route>
      </Route>
      <Route element={<Navigate replace to="/dashboard" />} path="*" />
    </Routes>
  );
}
