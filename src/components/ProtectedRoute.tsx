import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "admin" | "artisan" | "buyer";

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: AppRole | AppRole[];
}) {
  const { user, loading, isAdmin, isArtisan, isBuyer } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole) {
    const required = Array.isArray(requireRole) ? requireRole : [requireRole];
    const hasRole =
      (required.includes("admin") && isAdmin) ||
      (required.includes("artisan") && isArtisan) ||
      (required.includes("buyer") && isBuyer);

    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
}

