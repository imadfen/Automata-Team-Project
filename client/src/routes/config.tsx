import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import { paths } from "./paths";
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import LoadingScreen from "../components/LoadingScreen";

const Loadable = (Component: React.LazyExoticComponent<any>) => (props: any) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// Auth
const LoginPage = Loadable(lazy(() => import("@/pages/auth/LoginPage")));
const RegisterPage = Loadable(lazy(() => import("@/pages/auth/RegisterPage")));

// Dashboard
const WarehouseDashboard = Loadable(
  lazy(() => import("@/components/warehouse/WarehouseDashboard"))
);

// Root error boundary component
const ErrorBoundary = Loadable(
  lazy(() => import("../components/ErrorBoundary"))
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <WarehouseDashboard />
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
        <WarehouseDashboard />
      </AuthGuard>
    ),
  },
  {
    path: paths.dashboard.root,
    element: (
      <AuthGuard>
        <WarehouseDashboard />
      </AuthGuard>
    ),
  },
];
