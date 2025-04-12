import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";
import LoadingScreen from "@/components/LoadingScreen";

interface GuestGuardProps {
  children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (token) {
    return <Navigate to={paths.dashboard.root} />;
  }

  return <>{children}</>;
}
