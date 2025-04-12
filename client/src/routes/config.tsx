import { RouteObject } from "react-router-dom";
import { paths } from "./paths";
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import WarehouseDashboard from "../components/warehouse/WarehouseDashboard";
import ErrorBoundary from "../components/ErrorBoundary";
import InventoryPage from "../pages/dashboard/InventoryPage";
import MainLayout from "../components/layouts/MainLayout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout>
          <WarehouseDashboard />
        </MainLayout>
      </AuthGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: paths.auth.login,
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: paths.auth.register,
    element: (
      <GuestGuard>
        <RegisterPage />
      </GuestGuard>
    ),
  },
  {
    path: paths.dashboard.warehouse,
    element: (
      <AuthGuard>
        <MainLayout>
          <WarehouseDashboard />
        </MainLayout>
      </AuthGuard>
    ),
  },
  {
    path: paths.dashboard.inventory,
    element: (
      <AuthGuard>
        <MainLayout>
          <InventoryPage />
        </MainLayout>
      </AuthGuard>
    ),
  },
  {
    path: paths.dashboard.root,
    element: (
      <AuthGuard>
        <MainLayout>
          <WarehouseDashboard />
        </MainLayout>
      </AuthGuard>
    ),
  },
];
