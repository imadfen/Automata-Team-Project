import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";
import LoadingScreen from "@/components/LoadingScreen";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to={paths.auth.login} />;
  }

  return <>{children}</>;
}
