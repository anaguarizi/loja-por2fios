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

  if (loading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole) {
    const required = Array.isArray(requireRole) ? requireRole : [requireRole];
    const userRoles = {
      admin: isAdmin,
      artisan: isArtisan,
      buyer: isBuyer,
    };

    const hasRole = required.some((role) => userRoles[role]);

    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
}

