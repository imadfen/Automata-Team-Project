import { RouteObject } from "react-router-dom";
import { paths } from "./paths";
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import WarehouseDashboard from "../components/warehouse/WarehouseDashboard";
import ErrorBoundary from "../components/ErrorBoundary";
import InventoryPage from "../pages/dashboard/InventoryPage";
import DevicesPage from "../pages/dashboard/DevicesPage";
import MainLayout from "../components/layouts/MainLayout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout>
          <div className="size-full">
            <h1 className="text-2xl font-bold">Welcome to automata</h1>
            <p className="text-gray-600">
              here you can see a globale statistics of your warehouse and manage
              your devices.
            </p>
          </div>
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
          <div className="size-full">
            <h1 className="text-2xl font-bold">Welcome to automata</h1>
            <p className="text-gray-600">
              here you can see a globale statistics of your warehouse and manage
              your devices.
            </p>
          </div>
        </MainLayout>
      </AuthGuard>
    ),
  },
  {
    path: paths.dashboard.devices,
    element: (
      <AuthGuard>
        <MainLayout>
          <DevicesPage />
        </MainLayout>
      </AuthGuard>
    ),
  },
];
